# TechService - Full Stack Service & Rental Management System

A complete full-stack application for managing service jobs and product rentals, built with Django REST Framework backend and React frontend.

## Project Structure

```
cursor/
├── backend/              # Django REST API
│   ├── api/             # API app (models, views, serializers)
│   ├── backend/         # Django settings, URLs, ASGI/WSGI
│   ├── manage.py        # Django management script
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables (create from env.example.txt)
│
├── frontend/            # React SPA
│   ├── src/            # React source code
│   ├── public/         # Static assets
│   ├── package.json    # Node dependencies
│   └── .env           # Frontend env vars (create from .env.example)
│
└── README.md           # This file
```

## Tech Stack

### Backend
- **Django 5.0.6** - Web framework
- **Django REST Framework** - API framework
- **Django Channels** - WebSocket support
- **MySQL** - Database
- **Daphne** - ASGI server
- **django-cors-headers** - CORS handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

## Prerequisites

1. **Python 3.10+**
2. **Node.js 16+**
3. **MySQL 8.0+** (or MariaDB)
4. **Git** (optional)

## Quick Start - Local Development

### Step 1: Clone and Navigate
```bash
cd cursor
```

### Step 2: Database Setup
Create a MySQL database:
```sql
CREATE DATABASE best_in_solutions CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

Backend will run at: **http://localhost:8000**

### Step 4: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd cursor/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

### Step 5: Access the Application

- **Frontend App**: http://localhost:5173
- **Admin Panel**: http://localhost:8000/admin
- **API Endpoints**: http://localhost:8000/api/

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs/` | GET, POST | List/create jobs |
| `/api/jobs/<id>/` | GET, PUT, DELETE | Retrieve/update/delete job |
| `/api/rentals/` | GET, POST | List/create rentals |
| `/api/devices/` | GET, POST | List/create devices |
| `/api/reports/` | GET, POST | List/create job reports |
| `/api/auth/token/` | POST | Get authentication token |
| `/admin/` | - | Django admin panel |

## WebSocket Support

Real-time notifications via WebSocket:
- **URL**: `ws://localhost:8000/ws/notifications/`
- Automatically broadcasts messages to all connected clients

## Environment Variables

### Backend (.env file in backend/)
```env
# Django Settings
SECRET_KEY=your-secure-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=best_in_solutions
DB_PORT=3306

# CORS (Frontend URLs)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: Redis for production WebSocket
# CHANNEL_REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env file in frontend/)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Production Deployment

### Option 1: Traditional VPS/Server

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

### Option 2: Platform-as-a-Service

- **Frontend**: Vercel, Netlify, or Render
- **Backend**: Heroku, Railway, or PythonAnywhere
- **Database**: Supabase, PlanetScale (MySQL), or AWS RDS

## Commands Reference

### Backend Commands
```bash
cd backend

# Run server
python manage.py runserver

# Run with Daphne (ASGI/WebSocket support)
daphne -b 0.0.0.0 -p 8000 backend.asgi:application

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (production)
python manage.py collectstatic

# Shell
python manage.py shell
```

### Frontend Commands
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

See [errors.md](errors.md) for common issues and solutions.

## Demo Credentials

After creating superuser:
- **Admin**: Use the credentials you created with `createsuperuser`
- **API Token**: Get from `/api/auth/token/`

## License

MIT
