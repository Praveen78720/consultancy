# Common Errors & Solutions

This document lists common issues you may encounter and their solutions.

## Backend Errors

### 1. MySQL Connection Error
**Error:**
```
django.db.utils.OperationalError: (2003, "Can't connect to MySQL server on 'localhost'")
```

**Solution:**
- Ensure MySQL server is running
- Check DB_HOST in `.env` file (try `127.0.0.1` instead of `localhost`)
- Verify MySQL credentials (DB_USER, DB_PASSWORD)
- Ensure database `best_in_solutions` exists

```sql
CREATE DATABASE best_in_solutions CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. mysqlclient Installation Error
**Error:**
```
ERROR: Could not build wheels for mysqlclient
```

**Solution:**

**Windows:**
1. Download MySQL C++ Connector from: https://dev.mysql.com/downloads/connector/cpp/
2. Or use precompiled wheel:
```bash
pip install --only-binary :all: mysqlclient
```

**Alternative (use PyMySQL):**
Replace `mysqlclient` in requirements.txt with:
```
PyMySQL==1.1.0
```

Then add to `backend/backend/__init__.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

---

### 3. Migration Errors
**Error:**
```
django.db.utils.ProgrammingError: (1146, "Table 'best_in_solutions.api_job' doesn't exist")
```

**Solution:**
```bash
cd backend
python manage.py makemigrations api
python manage.py migrate
```

If that doesn't work, reset migrations:
```bash
cd backend
rm -rf api/migrations/*.py
python manage.py makemigrations api
python manage.py migrate
```

---

### 4. CORS Errors
**Error (in browser console):**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/jobs/' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
Update `backend/.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

Restart the backend server after changing `.env`.

---

### 5. PORT Already in Use
**Error:**
```
Error: That port is already in use.
```

**Solution:**
Find and kill the process using the port, or use a different port:
```bash
# Use different port
python manage.py runserver 8001
```

---

### 6. ModuleNotFoundError
**Error:**
```
ModuleNotFoundError: No module named 'channels' (or any other package)
```

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

Ensure virtual environment is activated.

---

### 7. Permission Denied (Media Uploads)
**Error:**
```
Permission denied: '/path/to/media/rentals/'
```

**Solution:**
```bash
# Create media directory with proper permissions
mkdir -p backend/media/rentals
chmod -R 755 backend/media
```

On Windows, ensure the application has write permissions to the `media` folder.

---

## Frontend Errors

### 1. npm install Errors
**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### 2. Vite Port Already in Use
**Error:**
```
Port 5173 is already in use
```

**Solution:**
```bash
npm run dev -- --port 3000
```

Or kill the process using port 5173.

---

### 3. API Connection Failed
**Error (in browser console):**
```
Failed to fetch
TypeError: NetworkError when attempting to fetch resource.
```

**Solution:**
1. Ensure backend is running on `http://localhost:8000`
2. Check `frontend/.env` has correct API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Restart frontend dev server after changing `.env`
4. Check CORS settings in backend

---

### 4. Build Errors
**Error:**
```
[vite]: Rollup failed to resolve import
```

**Solution:**
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

---

## WebSocket Errors

### 1. WebSocket Connection Failed
**Error:**
```
WebSocket connection to 'ws://localhost:8000/ws/notifications/' failed
```

**Solution:**
- Ensure you're using Daphne, not just `runserver`:
  ```bash
  daphne -b 0.0.0.0 -p 8000 backend.asgi:application
  ```
- For development, `runserver` should work with Channels
- Check if Redis is running (if configured for production)

---

## Deployment Errors

### 1. Static Files Not Found (404)
**Error:**
Static files return 404 in production

**Solution:**
```bash
cd backend
python manage.py collectstatic
```

Ensure `STATIC_ROOT` is set in settings.py and web server (Nginx/Apache) is configured to serve static files.

---

### 2. WhiteNoise Configuration
**Error:**
Static files not serving with WhiteNoise

**Solution:**
Add to `settings.py`:
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... other middleware
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

Install whitenoise:
```bash
pip install whitenoise
```

---

### 3. Database Connection in Production
**Error:**
```
django.db.utils.OperationalError: could not translate host name
```

**Solution:**
- Verify database credentials in environment variables
- Ensure database server allows connections from your IP
- Check firewall rules

---

## General Troubleshooting Steps

1. **Check if servers are running:**
   - Backend: http://localhost:8000/api/jobs/
   - Frontend: http://localhost:5173

2. **Verify environment variables:**
   - Backend `.env` file exists and has correct values
   - Frontend `.env` file exists with correct API URL

3. **Restart servers after config changes:**
   - Both backend and frontend need restart after `.env` changes

4. **Check logs:**
   - Backend: Look at terminal output
   - Frontend: Browser DevTools Console (F12)

5. **Clear caches:**
   - Browser cache (Ctrl+Shift+R for hard refresh)
   - node_modules (delete and reinstall)
   - Python cache: `find . -type d -name __pycache__ -exec rm -r {} +`

## Still Having Issues?

1. Check the GitHub repository for similar issues
2. Review Django logs: `backend/logs/` (if configured)
3. Open browser DevTools (F12) → Network tab → Check failed requests
4. Verify all prerequisites are installed (Python, Node, MySQL)
