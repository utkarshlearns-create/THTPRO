
class AdminAssignTutorView(APIView):
    """
    Admin manually assigns a tutor to a job.
    Creates a HIRED application and updates job status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"error": "Admin access required"}, status=403)
            
        job_post = get_object_or_404(JobPost, pk=pk)
        tutor_id = request.data.get('tutor_id')
        
        if not tutor_id:
             return Response({"error": "Tutor ID is required"}, status=400)
             
        try:
            tutor_profile = TutorProfile.objects.get(pk=tutor_id)
        except TutorProfile.DoesNotExist:
            return Response({"error": "Tutor not found"}, status=404)
            
        # Create or Update Application
        application, created = Application.objects.get_or_create(
            job=job_post,
            tutor=tutor_profile
        )
        
        application.status = 'HIRED'
        application.save()
        
        # Update Job Status
        job_post.status = 'ASSIGNED'
        job_post.save()
        
        # Notify Tutor
        send_notification(
            user=tutor_profile.user,
            notification_type='JOB_ASSIGNED', # Need to ensure this type exists or use SYSTEM
            message=f"You have been manually assigned to the job: {job_post.class_grade} - {job_post.subjects}",
            related_job=job_post
        )
        
        # Notify Parent
        if job_post.parent: # Assuming parent posted it or is linked
             send_notification(
                user=job_post.parent,
                notification_type='JOB_FILLED',
                message=f"A tutor ({tutor_profile.full_name}) has been assigned to your job request.",
                related_job=job_post
             )
        
        return Response({
            "message": f"Job assigned to {tutor_profile.full_name}",
            "job_id": job_post.id,
            "tutor_id": tutor_profile.id,
            "status": "ASSIGNED"
        })
