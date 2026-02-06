"""
JCRM - Customer Relationship Management System
Copyright (c) 2024-2026 Julio Cesar Mendez Tobar. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL

This software and associated documentation files (the "Software") are
the proprietary and confidential information of Julio Cesar Mendez Tobar.

Unauthorized copying, modification, distribution, or use of this software,
via any medium, is strictly prohibited without the express written permission
of the copyright holder.

Author: Julio Cesar Mendez Tobar

For licensing inquiries, please contact the author.

---

A fully functional CRM application for managing clients, contacts, activities, and tasks.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

db = SQLAlchemy(app)

# Database Models
class Client(db.Model):
    """Client/Company model"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    phone = db.Column(db.String(50))
    company = db.Column(db.String(200))
    address = db.Column(db.Text)
    status = db.Column(db.String(50), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    contacts = db.relationship('Contact', backref='client', lazy=True, cascade='all, delete-orphan')
    activities = db.relationship('Activity', backref='client', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'company': self.company,
            'address': self.address,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }

class Contact(db.Model):
    """Contact person model"""
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200))
    phone = db.Column(db.String(50))
    position = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'position': self.position,
            'notes': self.notes,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }

class Activity(db.Model):
    """Activity/Interaction model"""
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # call, email, meeting, note
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'type': self.type,
            'subject': self.subject,
            'description': self.description,
            'date': self.date.strftime('%Y-%m-%d %H:%M'),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }

class Task(db.Model):
    """Task/Todo model"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='pending')  # pending, completed
    priority = db.Column(db.String(50), default='medium')  # low, medium, high
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.strftime('%Y-%m-%d') if self.due_date else None,
            'status': self.status,
            'priority': self.priority,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }

# Initialize database
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    """Dashboard view"""
    return render_template('dashboard.html')

@app.route('/clients')
def clients_page():
    """Clients management page"""
    return render_template('clients.html')

@app.route('/contacts')
def contacts_page():
    """Contacts management page"""
    return render_template('contacts.html')

@app.route('/activities')
def activities_page():
    """Activities management page"""
    return render_template('activities.html')

@app.route('/tasks')
def tasks_page():
    """Tasks management page"""
    return render_template('tasks.html')

# API Endpoints - Clients
@app.route('/api/clients', methods=['GET'])
def get_clients():
    """Get all clients"""
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    
    query = Client.query
    if search:
        query = query.filter(
            (Client.name.ilike(f'%{search}%')) |
            (Client.email.ilike(f'%{search}%')) |
            (Client.company.ilike(f'%{search}%'))
        )
    if status:
        query = query.filter(Client.status == status)
    
    clients = query.order_by(Client.created_at.desc()).all()
    return jsonify([client.to_dict() for client in clients])

@app.route('/api/clients/<int:client_id>', methods=['GET'])
def get_client(client_id):
    """Get a specific client"""
    client = Client.query.get_or_404(client_id)
    return jsonify(client.to_dict())

@app.route('/api/clients', methods=['POST'])
def create_client():
    """Create a new client"""
    data = request.get_json()
    
    client = Client(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone', ''),
        company=data.get('company', ''),
        address=data.get('address', ''),
        status=data.get('status', 'active')
    )
    
    db.session.add(client)
    db.session.commit()
    
    return jsonify(client.to_dict()), 201

@app.route('/api/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    """Update a client"""
    client = Client.query.get_or_404(client_id)
    data = request.get_json()
    
    client.name = data.get('name', client.name)
    client.email = data.get('email', client.email)
    client.phone = data.get('phone', client.phone)
    client.company = data.get('company', client.company)
    client.address = data.get('address', client.address)
    client.status = data.get('status', client.status)
    
    db.session.commit()
    
    return jsonify(client.to_dict())

@app.route('/api/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    """Delete a client"""
    client = Client.query.get_or_404(client_id)
    db.session.delete(client)
    db.session.commit()
    
    return '', 204

# API Endpoints - Contacts
@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    """Get all contacts"""
    client_id = request.args.get('client_id', type=int)
    
    query = Contact.query
    if client_id:
        query = query.filter(Contact.client_id == client_id)
    
    contacts = query.order_by(Contact.created_at.desc()).all()
    return jsonify([contact.to_dict() for contact in contacts])

@app.route('/api/contacts', methods=['POST'])
def create_contact():
    """Create a new contact"""
    data = request.get_json()
    
    contact = Contact(
        client_id=data['client_id'],
        name=data['name'],
        email=data.get('email', ''),
        phone=data.get('phone', ''),
        position=data.get('position', ''),
        notes=data.get('notes', '')
    )
    
    db.session.add(contact)
    db.session.commit()
    
    return jsonify(contact.to_dict()), 201

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    """Update a contact"""
    contact = Contact.query.get_or_404(contact_id)
    data = request.get_json()
    
    contact.name = data.get('name', contact.name)
    contact.email = data.get('email', contact.email)
    contact.phone = data.get('phone', contact.phone)
    contact.position = data.get('position', contact.position)
    contact.notes = data.get('notes', contact.notes)
    
    db.session.commit()
    
    return jsonify(contact.to_dict())

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Delete a contact"""
    contact = Contact.query.get_or_404(contact_id)
    db.session.delete(contact)
    db.session.commit()
    
    return '', 204

# API Endpoints - Activities
@app.route('/api/activities', methods=['GET'])
def get_activities():
    """Get all activities"""
    client_id = request.args.get('client_id', type=int)
    
    query = Activity.query
    if client_id:
        query = query.filter(Activity.client_id == client_id)
    
    activities = query.order_by(Activity.date.desc()).all()
    return jsonify([activity.to_dict() for activity in activities])

@app.route('/api/activities', methods=['POST'])
def create_activity():
    """Create a new activity"""
    data = request.get_json()
    
    try:
        activity_date = datetime.fromisoformat(data['date']) if 'date' in data and data['date'] else datetime.utcnow()
    except (ValueError, TypeError):
        activity_date = datetime.utcnow()
    
    activity = Activity(
        client_id=data['client_id'],
        type=data['type'],
        subject=data['subject'],
        description=data.get('description', ''),
        date=activity_date
    )
    
    db.session.add(activity)
    db.session.commit()
    
    return jsonify(activity.to_dict()), 201

@app.route('/api/activities/<int:activity_id>', methods=['PUT'])
def update_activity(activity_id):
    """Update an activity"""
    activity = Activity.query.get_or_404(activity_id)
    data = request.get_json()
    
    activity.type = data.get('type', activity.type)
    activity.subject = data.get('subject', activity.subject)
    activity.description = data.get('description', activity.description)
    if 'date' in data and data['date']:
        try:
            activity.date = datetime.fromisoformat(data['date'])
        except (ValueError, TypeError):
            pass  # Keep existing date if invalid format
    
    db.session.commit()
    
    return jsonify(activity.to_dict())

@app.route('/api/activities/<int:activity_id>', methods=['DELETE'])
def delete_activity(activity_id):
    """Delete an activity"""
    activity = Activity.query.get_or_404(activity_id)
    db.session.delete(activity)
    db.session.commit()
    
    return '', 204

# API Endpoints - Tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    status = request.args.get('status', '')
    
    query = Task.query
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.get_json()
    
    due_date = None
    if 'due_date' in data and data['due_date']:
        try:
            due_date = datetime.fromisoformat(data['due_date'])
        except (ValueError, TypeError):
            pass  # Leave as None if invalid format
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        due_date=due_date,
        status=data.get('status', 'pending'),
        priority=data.get('priority', 'medium')
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    if 'due_date' in data:
        if data['due_date']:
            try:
                task.due_date = datetime.fromisoformat(data['due_date'])
            except (ValueError, TypeError):
                pass  # Keep existing due_date if invalid format
        else:
            task.due_date = None
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)
    
    db.session.commit()
    
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    
    return '', 204

# API Endpoint - Dashboard Stats
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    total_clients = Client.query.count()
    active_clients = Client.query.filter(Client.status == 'active').count()
    total_contacts = Contact.query.count()
    total_activities = Activity.query.count()
    pending_tasks = Task.query.filter(Task.status == 'pending').count()
    completed_tasks = Task.query.filter(Task.status == 'completed').count()
    
    recent_activities = Activity.query.order_by(Activity.date.desc()).limit(5).all()
    upcoming_tasks = Task.query.filter(Task.status == 'pending').order_by(Task.due_date.asc().nullslast()).limit(5).all()
    
    return jsonify({
        'total_clients': total_clients,
        'active_clients': active_clients,
        'total_contacts': total_contacts,
        'total_activities': total_activities,
        'pending_tasks': pending_tasks,
        'completed_tasks': completed_tasks,
        'recent_activities': [activity.to_dict() for activity in recent_activities],
        'upcoming_tasks': [task.to_dict() for task in upcoming_tasks]
    })

if __name__ == '__main__':
    # Debug mode should only be enabled in development
    # Set DEBUG=False or remove debug parameter for production
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
