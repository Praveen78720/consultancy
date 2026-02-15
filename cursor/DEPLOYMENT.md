# Production Deployment Guide

This guide covers deploying the TechService application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Option 1: VPS/Server Deployment](#option-1-vpsserver-deployment)
4. [Option 2: Platform-as-a-Service](#option-2-platform-as-a-service)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure:
- [ ] Application works locally
- [ ] Database migrations are applied
- [ ] All environment variables are configured
- [ ] Static files collection is tested

---

## Deployment Options

### Quick Comparison

| Option | Difficulty | Cost | Best For |
|--------|------------|------|----------|
| VPS (DigitalOcean, AWS, etc.) | Medium | $5-20/month | Full control |
| Render/Railway | Easy | Free tier available | Quick deployment |
| Heroku | Easy | $7+/month | Simple apps |
| PythonAnywhere | Easy | Free tier | Python-focused |

---

## Option 1: VPS/Server Deployment

### Server Requirements
- Ubuntu 20.04/22.04 LTS
- 1GB+ RAM
- 20GB+ Storage

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv python3-dev nginx mysql-server redis-server git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 2: Database Setup

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE best_in_solutions CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'techservice'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON best_in_solutions.* TO 'techservice'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/techservice
cd /var/www/techservice

# Clone repository (or upload files)
git clone <your-repo-url> .

# Set ownership
sudo chown -R $USER:$USER /var/www/techservice
```

### Step 4: Backend Configuration

```bash
cd /var/www/techservice/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn whitenoise

# Create production .env file
nano .env
```

**Production .env:**
```env
SECRET_KEY=your-very-secure-random-key-here-min-50-chars
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-server-ip

DB_HOST=localhost
DB_USER=techservice
DB_PASSWORD=your_secure_password
DB_NAME=best_in_solutions
DB_PORT=3306

CORS_ALLOWED_ORIGINS=https://your-domain.com

CHANNEL_REDIS_URL=redis://localhost:6379/0
```

```bash
# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### Step 5: Frontend Build

```bash
cd /var/www/techservice/frontend

# Install dependencies
npm install

# Create production .env
echo "VITE_API_BASE_URL=https://your-domain.com" > .env

# Build
npm run build

# Move build to backend static folder
sudo mkdir -p /var/www/techservice/backend/staticfiles/app
sudo cp -r dist/* /var/www/techservice/backend/staticfiles/app/
```

### Step 6: Systemd Services

Create Daphne service for backend:

```bash
sudo nano /etc/systemd/system/techservice-backend.service
```

```ini
[Unit]
Description=TechService Backend (Daphne)
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/techservice/backend
Environment=PATH=/var/www/techservice/backend/venv/bin
ExecStart=/var/www/techservice/backend/venv/bin/daphne -b 127.0.0.1 -p 8000 backend.asgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable techservice-backend
sudo systemctl start techservice-backend
```

### Step 7: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/techservice
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend static files
    location / {
        root /var/www/techservice/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API and admin
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static and media files
    location /static/ {
        alias /var/www/techservice/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/techservice/backend/media/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/techservice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Option 2: Platform-as-a-Service

### Deploy Frontend to Vercel

1. Push frontend code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.com`

### Deploy Backend to Render/Railway

1. Push backend code to GitHub
2. Create new Web Service
3. Set build command:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```
4. Set start command:
   ```bash
   daphne -b 0.0.0.0 -p $PORT backend.asgi:application
   ```
5. Add environment variables from `.env`

---

## Environment Configuration

### Production Checklist

**Backend:**
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` is strong and unique
- [ ] `ALLOWED_HOSTS` includes your domain
- [ ] Database credentials are correct
- [ ] `CORS_ALLOWED_ORIGINS` set to frontend URL
- [ ] Redis configured for WebSocket (optional)

**Frontend:**
- [ ] `VITE_API_BASE_URL` points to backend
- [ ] Build completes without errors
- [ ] All API calls use relative paths or correct base URL

---

## Post-Deployment

### Verification Steps

1. **Test Frontend**: https://your-domain.com
2. **Test API**: https://your-domain.com/api/jobs/
3. **Test Admin**: https://your-domain.com/admin/
4. **Test WebSocket**: wss://your-domain.com/ws/notifications/

### Monitoring

Check service status:
```bash
sudo systemctl status techservice-backend
sudo systemctl status nginx
sudo journalctl -u techservice-backend -f
```

### Backup Strategy

```bash
# Database backup script
mysqldump -u techservice -p best_in_solutions > backup_$(date +%Y%m%d).sql

# Add to crontab for daily backups
0 2 * * * /var/www/techservice/backup.sh
```

---

## Updating the Application

```bash
cd /var/www/techservice

# Pull latest changes
git pull

# Backend updates
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart techservice-backend

# Frontend updates
cd ../frontend
npm install
echo "VITE_API_BASE_URL=https://your-domain.com" > .env
npm run build
```

---

## Troubleshooting Deployment

See [errors.md](errors.md) for common issues.

For deployment-specific issues:
1. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
2. Check application logs: `sudo journalctl -u techservice-backend -f`
3. Verify all environment variables are set
4. Ensure firewall allows ports 80, 443

---

## Security Considerations

1. **Change default passwords** (admin, database)
2. **Use HTTPS only** (Let's Encrypt)
3. **Regular updates**: `sudo apt update && sudo apt upgrade`
4. **Firewall**: Only open ports 22 (SSH), 80, 443
5. **Database**: Use strong password, restrict access
6. **Secrets**: Never commit `.env` files to Git
