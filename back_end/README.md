# IndyTrack Backend

This is the backend server for the IndyTrack application, built with Flask and SQLAlchemy.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with the following variables:
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///indytrack.db
FLASK_DEBUG=True
```

## Running the Server

1. Activate the virtual environment if not already activated:
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Run the Flask application:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Users
- `POST /api/users` - Create a new user

### Tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/<user_id>` - Get all tasks for a user
- `PUT /api/tasks/<task_id>` - Update a task

### Notifications
- `GET /api/notifications/<user_id>` - Get all notifications for a user

## Database

The application uses SQLite by default, but can be configured to use PostgreSQL by changing the `DATABASE_URL` in the `.env` file. 