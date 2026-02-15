# Codebase Analysis & MySQL Migration Plan

## Project Overview
- **Project Name:** Best In Solutions - Service and Rental Management System
- **Current Stack:** React (Vite) + Django (SQLite) + Node.js/Express (MySQL)
- **Goal:** Migrate Django from SQLite to MySQL and clean up unwanted files

---

## Part 1: Database Migration Steps (SQLite → MySQL)

### Step 1: Install MySQL Client for Django
**File:** `backend/requirements.txt`

Add `mysqlclient` package (requires MySQL development headers on system):
```
django==5.0.6
djangorestframework==3.15.2
channels==4.1.0
channels-redis==4.2.0
daphne==4.1.2
psycopg2-binary==2.9.9
dj-database-url==2.2.0
python-dotenv==1.0.1
django-cors-headers==4.3.1
mysqlclient==2.2.4  # <-- ADD THIS
```

**Alternative (if mysqlclient fails):** Use `PyMySQL` as pure Python driver.

### Step 2: Update Django Settings
**File:** `backend/backend/settings.py`

Replace the DATABASES configuration:
```python
# MySQL Database Configuration
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME", "best_in_solutions"),
        "USER": os.getenv("DB_USER", "root"),
        "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

### Step 3: Create Environment File
**File:** `backend/.env` (CREATE NEW)

```
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=*

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=78720
DB_NAME=best_in_solutions
DB_PORT=3306

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# WebSocket (optional - for production use Redis)
# CHANNEL_REDIS_URL=redis://localhost:6379/0
```

### Step 4: Database Schema Considerations

**Current Models Requiring Migration:**

1. **Job** table:
   - id (BigAutoField, PK)
   - customer_name (varchar 255)
   - phone_number (varchar 50)
   - location (varchar 255)
   - issue (text)
   - work_date (date)
   - priority (varchar 10)
   - status (varchar 20)
   - created_at (datetime)

2. **Rental** table:
   - id (BigAutoField, PK)
   - customer_name (varchar 255)
   - phone_number (varchar 50)
   - device_serial (varchar 100)
   - from_date (date)
   - to_date (date)
   - rental_days (int unsigned)
   - security_deposit (decimal 10,2)
   - id_proof (varchar 100, nullable) - stores image path
   - created_at (datetime)

3. **Device** table:
   - id (BigAutoField, PK)
   - serial_no (varchar 100, UNIQUE)
   - model (varchar 255)
   - availability (varchar 20)

4. **JobReport** table:
   - id (BigAutoField, PK)
   - job_id (FK to Job)
   - company_name (varchar 255)
   - time_taken (varchar 100)
   - equipment_used (text)
   - work_description (text)
   - completion_photo_url (varchar 200, nullable)
   - created_at (datetime)

### Step 5: Run Migrations
```bash
cd backend

# Create MySQL database first (via MySQL CLI or automatically)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS best_in_solutions CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Install new requirements
pip install mysqlclient==2.2.4

# Run Django migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser if needed
python manage.py createsuperuser
```

### Step 6: Data Migration (Optional - if preserving existing data)
If you need to migrate existing SQLite data to MySQL:

```bash
# Export SQLite data
python manage.py dumpdata > data.json

# Switch to MySQL in settings, then:
python manage.py migrate
python manage.py loaddata data.json
```

---

## Part 2: Unwanted Files to Delete

### CRITICAL: Remove from Git (Already Committed)
These files should be removed from git tracking and added to .gitignore:

1. **Python Cache Files:**
   - All `__pycache__/` directories (485+ found)
   - All `*.pyc`, `*.pyo`, `*.pyd` files
   - Locations: `backend/**/__pycache__/`, `venv/**/__pycache__/`

2. **Virtual Environment:**
   - `venv/` directory (entire directory)
   - Should never be committed

3. **Node Modules:**
   - `node_modules/` in root
   - `backend/node_modules/` (if exists)
   - `backend/api/node_modules/`

4. **Database Files:**
   - `backend/db.sqlite3` - SQLite database

5. **Environment Files with Secrets:**
   - `backend/api/.env` - Contains real credentials and encryption key
   - MUST REMOVE from git history using `git filter-branch` or BFG

6. **Uploaded Media:**
   - `backend/media/rentals/*.jpeg` - User uploaded content
   - Should be in .gitignore

7. **Log Files:**
   - Any `*.log` files
   - `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`

### Commands to Clean Git History:
```bash
# Remove files from git but keep locally
git rm -r --cached backend/api/.env
git rm -r --cached backend/db.sqlite3
git rm -r --cached venv/
git rm -r --cached node_modules/
git rm -r --cached backend/**/__pycache__/
git rm -r --cached backend/media/rentals/

# For secrets in history, use BFG or filter-branch (requires force push)
# git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/api/.env' HEAD
```

---

## Part 3: Configuration Updates

### Update .gitignore
**File:** `A:\cursor (3)\cursor\.gitignore` (UPDATE)

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Node
node_modules
dist
dist-ssr
*.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Django
*.sqlite3
db.sqlite3
media/
staticfiles/

# Environment
.env
.env.local
.env.*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
*~

# Windows
Thumbs.db
Desktop.ini
```

### Update Frontend API Configuration
**File:** `src/config.js` (DECISION NEEDED)

Currently points to Node.js backend (port 5000). After MySQL migration, decide:

**Option A:** Keep using Node.js (already uses MySQL)
- No changes needed to config.js
- But why have Django then?

**Option B:** Switch to Django backend
- Change to: `http://localhost:8000`
- Update all API calls in components

**Recommendation:** Choose ONE backend. Suggest keeping Django and removing Node.js for consistency.

---

## Part 4: MySQL-Specific Model Adjustments

### Check MySQL Compatibility
**File:** `backend/api/models.py`

Models are mostly compatible, but verify:

1. **ImageField storage:** MySQL stores path as VARCHAR. Ensure `MEDIA_ROOT` and `MEDIA_URL` are properly configured.

2. **DecimalField:** `security_deposit` uses Decimal(10,2) - fully compatible.

3. **Unique Constraints:** `Device.serial_no` has `unique=True` - MySQL supports this.

4. **ForeignKey:** `JobReport.job` uses CASCADE - supported.

### Optional: Add MySQL-specific Indexes
For better performance on large datasets, add indexes:

```python
class Meta:
    indexes = [
        models.Index(fields=['status', 'priority']),  # For Job filtering
        models.Index(fields=['created_at']),           # For sorting
        models.Index(fields=['device_serial']),        # For Rental lookups
    ]
```

---

## Part 5: Testing Checklist

After migration, verify:

- [ ] Django starts without errors: `python manage.py runserver`
- [ ] All models migrate successfully
- [ ] Can create a Job record
- [ ] Can create a Rental record
- [ ] Can upload ID proof image
- [ ] Can create a Device
- [ ] Can create a JobReport
- [ ] Foreign key relationships work (Job → JobReport)
- [ ] WebSocket functionality works (if using Channels)
- [ ] API endpoints return correct data
- [ ] Frontend can connect and display data

---

## Part 6: Security Hardening

### Immediate Actions Required:

1. **Change hardcoded frontend credentials:**
   - File: `src/pages/Login.jsx` or wherever hardcoded
   - Currently: admin@techservice.com / password
   - Implement real authentication

2. **Rotate exposed credentials:**
   - Database password was exposed in `backend/api/.env`
   - Change MySQL root password immediately
   - Generate new Django SECRET_KEY
   - Generate new encryption key

3. **Create non-root MySQL user:**
   ```sql
   CREATE USER 'bestinsolutions'@'localhost' IDENTIFIED BY 'strong_password_here';
   GRANT ALL PRIVILEGES ON best_in_solutions.* TO 'bestinsolutions'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Restrict CORS in production:**
   - Currently allows all origins in dev
   - Set specific origins for production

---

## Part 7: Architecture Decision

### Current Issue: Dual Backend Problem
The project has TWO backends:
1. **Django** (port 8000) - Currently SQLite
2. **Node.js/Express** (port 5000) - Already MySQL

**Decision Required:** Choose ONE backend.

### Recommendation: Consolidate to Django
**Rationale:**
- Django ORM provides better data integrity
- Built-in admin interface
- Better authentication system
- WebSocket support via Channels
- Single technology stack (Python)

### If Choosing Django:
1. Complete this MySQL migration
2. Port any unique Node.js features to Django
3. Update frontend API_BASE_URL to port 8000
4. Remove Node.js backend entirely
5. Remove `backend/api/` (Node.js) directory

### If Choosing Node.js:
1. Keep Node.js as primary API
2. Remove Django backend entirely
3. No MySQL migration needed (already done in Node.js)
4. Simpler architecture

---

## Summary of Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `backend/requirements.txt` | Edit | Add mysqlclient |
| `backend/backend/settings.py` | Edit | Update DATABASES config |
| `backend/.env` | Create | MySQL credentials |
| `backend/api/models.py` | Review | Verify MySQL compatibility |
| `.gitignore` | Edit | Add Python/Django ignores |
| `backend/db.sqlite3` | Delete | Remove SQLite file |
| `venv/` | Delete | Remove virtual env |
| `__pycache__/` | Delete | All cache directories |
| `node_modules/` | Delete | All node_modules |
| `backend/api/.env` | Delete from git | Contains secrets |

---

## Questions for Stakeholder

Before proceeding, please clarify:

1. **Which backend should be primary?** Django or Node.js?
   - Both currently exist
   - Frontend points to Node.js (port 5000)
   - Node.js already uses MySQL

2. **Should we preserve existing SQLite data?**
   - If yes, need data export/import steps
   - If no, start fresh with MySQL

3. **MySQL credentials:**
   - Current password `78720` was exposed
   - Should we change it?
   - Should we create a dedicated MySQL user?

4. **Production deployment:**
   - Will this run on shared hosting, VPS, or cloud?
   - Need to configure for production environment?

5. **Node.js backend:**
   - Should it be removed entirely?
   - Or keep both backends?

---

## Next Steps

**Once you answer the above questions, I will:**

1. Make all necessary file modifications
2. Update configuration files
3. Clean up unwanted files
4. Test the migration
5. Provide verification steps

**Please review this document and let me know:**
- Which backend to keep (Django or Node.js)
- Whether to preserve existing data
- Your decision on the exposed credentials
