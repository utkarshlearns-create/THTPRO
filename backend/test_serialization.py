import os
import django
import traceback
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.request import Request

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()
from users.views import CurrentUserView

factory = RequestFactory()

def test_user(u):
    print(f"\n--- Testing User: {u.username} (Role: {u.role}) ---")
    from users.serializers import UserSerializer
    req = factory.get('/')
    req.user = u
    
    try:
        serializer = UserSerializer(u, context={'request': req})
        data = serializer.data
        print(f"SUCCESS: Data keys: {list(data.keys())}")
        print(f"Serialized role: {data.get('role')}")
        profile = data.get('tutor_profile')
        if profile:
            print(f"Tutor Profile image: {profile.get('image')}")
    except Exception as e:
        print(f"EXCEPTION: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    users = User.objects.all()[:10]
    for user in users:
        test_user(user)
