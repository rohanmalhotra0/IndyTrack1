from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Task, Notification
from config import Config
from datetime import datetime
import os
from functools import wraps
import jwt
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            raise Unauthorized('Token is missing')
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                raise Unauthorized('Invalid token')
        except jwt.ExpiredSignatureError:
            raise Unauthorized('Token has expired')
        except jwt.InvalidTokenError:
            raise Unauthorized('Invalid token')
        return f(current_user, *args, **kwargs)
    return decorated

@app.errorhandler(BadRequest)
@app.errorhandler(Unauthorized)
@app.errorhandler(NotFound)
def handle_error(error):
    response = jsonify({'error': error.description})
    response.status_code = error.code
    return response

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not all(k in data for k in ('username', 'email', 'password')):
            raise BadRequest('Missing required fields')
        
        if User.query.filter_by(username=data['username']).first():
            raise BadRequest('Username already exists')
        
        if User.query.filter_by(email=data['email']).first():
            raise BadRequest('Email already exists')
        
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'User created successfully'}), 201
    except ValueError as e:
        raise BadRequest(str(e))
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not all(k in data for k in ('username', 'password')):
            raise BadRequest('Missing username or password')
        
        user = User.query.filter_by(username=data['username']).first()
        if not user or not user.check_password(data['password']):
            raise Unauthorized('Invalid username or password')
        
        token = jwt.encode(
            {'user_id': user.id},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        return jsonify({'token': token})
    except Exception as e:
        raise BadRequest(str(e))

@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user):
    try:
        data = request.get_json()
        if not all(k in data for k in ('title', 'due_date')):
            raise BadRequest('Missing required fields')
        
        new_task = Task(
            title=data['title'],
            description=data.get('description'),
            due_date=datetime.fromisoformat(data['due_date']),
            priority=data.get('priority', 'medium'),
            user_id=current_user.id
        )
        
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify({
            'message': 'Task created successfully',
            'task_id': new_task.id
        }), 201
    except ValueError as e:
        raise BadRequest(str(e))
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date.isoformat(),
        'priority': task.priority,
        'status': task.status
    } for task in tasks])

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    try:
        task = Task.query.get_or_404(task_id)
        if task.user_id != current_user.id:
            raise Unauthorized('Not authorized to update this task')
        
        data = request.get_json()
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'due_date' in data:
            task.due_date = datetime.fromisoformat(data['due_date'])
        if 'priority' in data:
            task.priority = data['priority']
        if 'status' in data:
            task.status = data['status']
        
        db.session.commit()
        return jsonify({'message': 'Task updated successfully'})
    except ValueError as e:
        raise BadRequest(str(e))
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    notifications = []
    for task in tasks:
        task_notifications = Notification.query.filter_by(task_id=task.id).all()
        notifications.extend([{
            'id': notif.id,
            'task_id': notif.task_id,
            'message': notif.message,
            'is_read': notif.is_read,
            'created_at': notif.created_at.isoformat()
        } for notif in task_notifications])
    return jsonify(notifications)

if __name__ == '__main__':
    app.run(debug=True)
