from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include

def home(request):
    return JsonResponse({"message": "THTPRO Backend Running", "status": "active", "version": "v1.1"})

def health_check(request):
    from django.conf import settings
    from users.models import User, TutorProfile, TutorStatus
    from django.db.models import Count
    try:
        u_count = User.objects.count()
        t_count = TutorProfile.objects.count()
        db_host = settings.DATABASES['default'].get('HOST', 'unknown')
        
        # Status breakdown
        status_qs = TutorStatus.objects.values('status').annotate(count=Count('id')).order_by('-count')
        status_breakdown = {s['status']: s['count'] for s in status_qs}
        active_count = status_breakdown.get('ACTIVE', 0)
        
        return JsonResponse({
            "status": "ok", 
            "user_count": u_count, 
            "tutor_profile_count": t_count,
            "active_tutors": active_count,
            "tutor_status_breakdown": status_breakdown,
            "db_host": f"{db_host[:10]}...{db_host[-10:]}" if db_host else "unknown"
        })
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/health/', health_check),
    path('', home),
]
