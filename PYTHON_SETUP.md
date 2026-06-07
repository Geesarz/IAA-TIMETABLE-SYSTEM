# Python/FastAPI Backend Setup Guide

This guide explains how to set up and run the **IAA-CLASS TIMETABLE-SYSTEM-WITH-IAA** backend using Python and FastAPI.

## Prerequisites

- Python 3.8+
- MySQL 8.0+ (database)
- pip (Python package manager)

## Step 1: Install Python

Check if Python is installed:
```bash
python --version
```

If not installed, download from [python.org](https://www.python.org/downloads/)

## Step 2: Set Up Virtual Environment

Create a Python virtual environment to isolate dependencies:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt when activated.

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlalchemy** - ORM for database
- **mysql-connector-python** - MySQL driver
- **pydantic** - Data validation
- **python-dotenv** - Environment variables

## Step 4: Configure MySQL Database

See [MYSQL_SETUP.md](./MYSQL_SETUP.md) for complete MySQL setup instructions.

Quick setup:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE class_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'class_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON class_harmony.* TO 'class_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Initialize the schema:
```bash
mysql -u class_user -p class_harmony < DATABASE_SCHEMA.sql
```

## Step 5: Configure Environment

Create/update `.env.local` with MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=class_user
DB_PASSWORD=your_password_here
DB_NAME=class_harmony
DEBUG=True
API_BASE_URL=http://localhost:8000
```

## Step 6: Run the FastAPI Server

```bash
python main.py
```

Or use uvicorn directly for more control:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

## Step 7: Access the Application

- **API Base**: `http://localhost:8000/api`
- **Interactive API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

The interactive documentation is **auto-generated** from your FastAPI code!

## Step 8: Configure Frontend

Update the frontend API URL to point to the Python backend:

In your React frontend (if still using it), update `src/lib/api-client.ts`:

```typescript
// Change API_BASE_URL to:
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000/api";
```

Then start the frontend:
```bash
npm run dev
```

## API Endpoints

All endpoints work the same as before:

```
GET    /api/health                    # Health check
GET    /api/lecturers                 # Get all lecturers
POST   /api/lecturers                 # Create lecturer
PUT    /api/lecturers/{id}            # Update lecturer
DELETE /api/lecturers/{id}            # Delete lecturer

GET    /api/classrooms                # Get all classrooms
POST   /api/classrooms                # Create classroom
PUT    /api/classrooms/{id}           # Update classroom
DELETE /api/classrooms/{id}           # Delete classroom

GET    /api/groups                    # Get all student groups
POST   /api/groups                    # Create group
PUT    /api/groups/{id}               # Update group
DELETE /api/groups/{id}               # Delete group

GET    /api/courses                   # Get all courses
POST   /api/courses                   # Create course
PUT    /api/courses/{id}              # Update course
DELETE /api/courses/{id}              # Delete course

GET    /api/assignments               # Get all assignments
POST   /api/assignments               # Create assignment
POST   /api/assignments/batch         # Batch create assignments
DELETE /api/assignments/{id}          # Delete assignment
DELETE /api/assignments               # Delete all assignments

GET    /api/conflicts                 # Get detected conflicts

POST   /api/seed                      # Load sample data
```

## Testing Endpoints

Using curl:

```bash
# Health check
curl http://localhost:8000/api/health

# Get all lecturers
curl http://localhost:8000/api/lecturers

# Create a lecturer
curl -X POST http://localhost:8000/api/lecturers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john@uni.edu",
    "department": "Physics",
    "availability": [{"day": 1, "period": 1}, {"day": 3, "period": 2}]
  }'

# Load seed data
curl -X POST http://localhost:8000/api/seed
```

Or use the **interactive Swagger UI** at `http://localhost:8000/docs`

## Project Structure

```
.
├── main.py              # FastAPI application and all route endpoints
├── config.py            # Configuration and environment variables
├── database.py          # SQLAlchemy setup and database connection
├── models.py            # SQLAlchemy ORM models
├── schemas.py           # Pydantic request/response schemas
├── requirements.txt     # Python dependencies
├── DATABASE_SCHEMA.sql  # MySQL table definitions
├── .env.local           # Local environment variables (don't commit)
├── .env.example         # Example environment template
└── venv/               # Virtual environment (auto-created)
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'fastapi'"

Make sure your virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### "Access denied for user 'root'@'localhost'"

Check your MySQL credentials in `.env.local`:
```bash
mysql -u class_user -p
# Enter password when prompted
```

### "No module named 'mysql'"

Install the MySQL connector:
```bash
pip install mysql-connector-python
```

### "Database class_harmony doesn't exist"

Create the database:
```bash
mysql -u root -p
CREATE DATABASE class_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Running in Production

For production deployment:

1. **Disable debug mode**:
   ```env
   DEBUG=False
   ```

2. **Use a production ASGI server**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

3. **Run behind a reverse proxy** (Nginx, Apache)

4. **Use environment secrets** instead of `.env` file

5. **Enable HTTPS/SSL** certificates

6. **Keep Python and dependencies updated**

## Switching Back to Node.js

To revert to the Node.js/Hono backend:

```bash
npm run dev  # Start React frontend with Node.js backend
```

The Node.js server code is still in `src/api/routes.ts` and `src/server.ts`.

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM Tutorial](https://docs.sqlalchemy.org/en/20/orm/quickstart.html)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

---

For frontend setup with React, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).
