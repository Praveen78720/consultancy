# Test User Credentials

## Admin User

**Email:** admin@bestinsolutions.com
**Password:** Admin@123
**Role:** Admin (is_staff=True)

## Employee User

**Email:** employee@bestinsolutions.com
**Password:** Employee@123
**Role:** Employee

---

## Quick Setup

To create or reset these users, run:

```bash
cd backend
python create_test_users.py
```

---

## Manual User Creation

If you need to create users manually, use the Django shell:

### Create Admin User
```bash
cd backend
python manage.py shell
```

Then in the Python shell:
```python
from django.contrib.auth.models import User

# Create admin user
admin_user = User.objects.create_user(
    username='admin@bestinsolutions.com',
    email='admin@bestinsolutions.com',
    password='Admin@123',
    is_staff=True,
    is_superuser=True
)
print("Admin user created:", admin_user.email)

# Create employee user
employee_user = User.objects.create_user(
    username='employee@bestinsolutions.com',
    email='employee@bestinsolutions.com',
    password='Employee@123',
    is_staff=False,
    is_superuser=False
)
print("Employee user created:", employee_user.email)
```

### Using Django Admin
1. First create a superuser:
```bash
python manage.py createsuperuser
```

2. Enter details:
   - Username: admin@bestinsolutions.com
   - Email: admin@bestinsolutions.com
   - Password: Admin@123

3. Then run the server and login to Django Admin at http://localhost:8000/admin/
4. Create additional users from the admin panel
