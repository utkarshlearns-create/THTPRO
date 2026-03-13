import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

admins = User.objects.filter(role__in=['SUPERADMIN', 'COUNSELLOR', 'TUTOR_ADMIN'])
print("Admins list:")
for a in admins:
    print(f"ID: {a.id}, Username: {a.username}, Role: {a.role}")
