from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include

def home(request):
    return JsonResponse({"message": "THTPRO Backend Running", "status": "active", "version": "v1.1"})

def health_check(request):
    from users.models import User, TutorProfile
    try:
        u_count = User.objects.count()
        t_count = TutorProfile.objects.count()
        return JsonResponse({"status": "ok", "user_count": u_count, "tutor_profile_count": t_count})
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
