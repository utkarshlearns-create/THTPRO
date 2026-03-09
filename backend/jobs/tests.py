from django.test import TestCase
from jobs.models import JobPost, Application
from users.models import User, TutorProfile
from jobs.serializers import JobPostSerializer
from django.test import RequestFactory
from django.db.models import Prefetch

class SerializerPerformanceTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create(username="tutor", role="TEACHER")
        self.profile = self.user.tutor_profile
        self.parent = User.objects.create(username="parent", role="PARENT")

        for i in range(5):
            job = JobPost.objects.create(
                student_name=f"Test Student {i}",
                class_grade="Class 10",
                locality="Test Locality",
                posted_by=self.parent
            )
            Application.objects.create(job=job, tutor=self.profile, status="HIRED")

    def test_serializer_methods_with_prefetch(self):
        request = self.factory.get('/')
        request.user = self.user

        jobs = JobPost.objects.select_related('posted_by', 'assigned_admin').prefetch_related(
            Prefetch('applications', queryset=Application.objects.select_related('tutor__user'))
        )

        serializer = JobPostSerializer(jobs, many=True, context={'request': request})

        with self.assertNumQueries(7): # 1 for jobs, 1 for prefetched apps, 5 for favouritetutor
            data = serializer.data

        self.assertEqual(len(data), 5)
        self.assertEqual(data[0]['application_count'], 1)
        self.assertEqual(data[0]['has_applied'], True)
        self.assertIsNotNone(data[0]['assigned_tutor'])
