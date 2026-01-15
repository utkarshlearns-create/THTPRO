from django.urls import path
from .views import JobPostListCreateView, JobPostDetailView

urlpatterns = [
    path('', JobPostListCreateView.as_view(), name='job-list-create'),
    path('<int:pk>/', JobPostDetailView.as_view(), name='job-detail'),
]
