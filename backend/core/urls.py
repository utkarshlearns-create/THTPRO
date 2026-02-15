from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include

def home(request):
    return JsonResponse({"message": "THTPRO Backend Running", "status": "active", "version": "v1.1"})

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/health/', health_check),
    path('', home),
]
