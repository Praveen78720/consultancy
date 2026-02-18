import os
import sys

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.contrib.auth.models import User

print("Creating test users...")
print("-" * 40)

# Create admin user if doesn't exist
if not User.objects.filter(email='admin@bestinsolutions.com').exists():
    admin_user = User.objects.create_user(
        username='admin@bestinsolutions.com',
        email='admin@bestinsolutions.com',
        password='Admin@123',
        is_staff=True,
        is_superuser=True
    )
    print("[OK] Admin user created")
    print("  Email: admin@bestinsolutions.com")
    print("  Password: Admin@123")
else:
    admin = User.objects.get(email='admin@bestinsolutions.com')
    admin.set_password('Admin@123')
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    print("[OK] Admin user already exists - password reset")
    print("  Email: admin@bestinsolutions.com")
    print("  Password: Admin@123")

print()

# Create employee user if doesn't exist
if not User.objects.filter(email='employee@bestinsolutions.com').exists():
    employee_user = User.objects.create_user(
        username='employee@bestinsolutions.com',
        email='employee@bestinsolutions.com',
        password='Employee@123',
        is_staff=False,
        is_superuser=False
    )
    print("[OK] Employee user created")
    print("  Email: employee@bestinsolutions.com")
    print("  Password: Employee@123")
else:
    employee = User.objects.get(email='employee@bestinsolutions.com')
    employee.set_password('Employee@123')
    employee.save()
    print("[OK] Employee user already exists - password reset")
    print("  Email: employee@bestinsolutions.com")
    print("  Password: Employee@123")

print("-" * 40)
print("[DONE] Test users setup complete!")
print()
print("You can now login with:")
print("  Admin: admin@bestinsolutions.com / Admin@123")
print("  Employee: employee@bestinsolutions.com / Employee@123")
