# Quick Start Commands

## First Time Setup

### 1. Backend Setup
```bash
cd cursor/backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example)
cp env.example.txt .env

# Edit .env with your database credentials
# Then run migrations:
python manage.py migrate

# Create admin account
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

### 2. Frontend Setup (New Terminal)
```bash
cd cursor/frontend

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Start frontend development server
npm run dev
```

## Daily Development Commands

### Start Backend
```bash
cd cursor/backend
source venv/bin/activate  # Skip on Windows if already activated
python manage.py runserver
```

### Start Frontend (New Terminal)
```bash
cd cursor/frontend
npm run dev
```

### Access URLs
- Frontend App: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin

## Database Commands

```bash
# Make migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Open Django shell
python manage.py shell

# Create superuser
python manage.py createsuperuser

# Reset database (WARNING: deletes all data)
# Delete migrations and recreate:
rm api/migrations/0001_initial.py  # then:
python manage.py makemigrations
python manage.py migrate
```

## Build for Production

```bash
# Frontend build
cd cursor/frontend
npm run build

# Backend collect static
cd cursor/backend
python manage.py collectstatic
```

## Troubleshooting

```bash
# If pip install fails on mysqlclient (Windows)
pip install --only-binary :all: mysqlclient

# If npm install fails
cd cursor/frontend
rm -rf node_modules package-lock.json
npm install

# If migration errors occur
cd cursor/backend
python manage.py makemigrations api
python manage.py migrate

# Check for errors
cd cursor
cat errors.md
```

## Environment Variables

### Backend (.env)
- `SECRET_KEY` - Django secret key
- `DEBUG` - Set to False in production
- `DB_PASSWORD` - MySQL password
- `CORS_ALLOWED_ORIGINS` - Frontend URL

### Frontend (.env)
- `VITE_API_BASE_URL` - Backend API URL (e.g., http://localhost:8000)
