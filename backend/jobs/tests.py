from django.test import TestCase
from django.contrib.auth import get_user_model
from jobs.models import JobPost, Application
from users.models import TutorProfile, FavouriteTutor, ContactUnlock
from jobs.serializers import JobPostSerializer
from django.db.models import Prefetch

User = get_user_model()

class JobPostSerializerTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(username='tutor1', role='TEACHER')
        self.tutor1, _ = TutorProfile.objects.get_or_create(user=self.user1)

        self.user2 = User.objects.create(username='tutor2', role='TEACHER')
        self.tutor2, _ = TutorProfile.objects.get_or_create(user=self.user2)

        self.user3 = User.objects.create(username='parent1', role='PARENT')

        self.job1 = JobPost.objects.create(posted_by=self.user3, student_name="Student 1")
        self.job2 = JobPost.objects.create(posted_by=self.user3, student_name="Student 2")

        Application.objects.create(job=self.job1, tutor=self.tutor1, status='APPLIED')
        Application.objects.create(job=self.job1, tutor=self.tutor2, status='HIRED')
        Application.objects.create(job=self.job2, tutor=self.tutor1, status='SHORTLISTED')

    def test_serializer_methods_with_prefetch(self):
        jobs = JobPost.objects.prefetch_related(
            'applications',
            'applications__tutor',
            'applications__tutor__user',
            Prefetch('applications__tutor__favourited_by_parents', queryset=FavouriteTutor.objects.filter(parent=self.user1), to_attr='favourited_by_current_user'),
            Prefetch('applications__tutor__unlocked_by', queryset=ContactUnlock.objects.filter(parent=self.user1), to_attr='unlocked_by_current_user')
        ).select_related('posted_by', 'assigned_admin').all()

        class DummyRequest:
            user = self.user1
            @property
            def is_authenticated(self):
                return True

        context = {'request': DummyRequest()}
        serializer = JobPostSerializer(jobs, many=True, context=context)

        with self.assertNumQueries(6):
            data = list(serializer.data)

        job1_data = next((d for d in data if d['id'] == self.job1.id), None)
        job2_data = next((d for d in data if d['id'] == self.job2.id), None)

        self.assertIsNotNone(job1_data)
        self.assertIsNotNone(job2_data)

        self.assertEqual(job1_data['application_count'], 2)
        self.assertTrue(job1_data['has_applied'])
        self.assertIsNotNone(job1_data['assigned_tutor'])

        self.assertEqual(job2_data['application_count'], 1)
        self.assertTrue(job2_data['has_applied'])
        self.assertIsNone(job2_data['assigned_tutor'])
