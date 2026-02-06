# JCRM - Customer Relationship Management System

**Author:** Julio Cesar Mendez Tobar  
**Copyright:** © 2024-2026 Julio Cesar Mendez Tobar. All Rights Reserved.  
**License:** Proprietary  

## About

A fully functional web-based CRM (Customer Relationship Management) application for managing clients, contacts, activities, and tasks.

## Features

- **Client Management**: Add, edit, delete, and search clients with detailed information
- **Contact Management**: Track contact persons associated with clients
- **Activity Tracking**: Log calls, emails, meetings, and notes for each client
- **Task Management**: Create and manage tasks with priorities and due dates
- **Dashboard**: View statistics and recent activities at a glance
- **Search & Filter**: Quick search and filtering capabilities across all modules
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Backend**: Python Flask, SQLAlchemy
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Architecture**: RESTful API with Single Page Application (SPA) interface

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ninoyerbas/JCRM-.git  
# Note: Repository URL contains legacy username for compatibility
cd JCRM-
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

For production deployment, set environment variables:
```bash
export FLASK_DEBUG=False
export SECRET_KEY=your-secure-random-secret-key
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

### Dashboard
View overall statistics including total clients, active clients, contacts, and pending tasks. See recent activities and upcoming tasks at a glance.

### Clients
- Click "Add Client" to create a new client
- Use the search bar to find clients by name, email, or company
- Filter clients by status (Active/Inactive)
- Edit or delete existing clients

### Contacts
- Add contact persons associated with specific clients
- Track contact information including email, phone, position
- Add notes for each contact

### Activities
- Log different types of interactions: calls, emails, meetings, notes
- Associate activities with clients
- Track activity dates and descriptions

### Tasks
- Create tasks with titles, descriptions, and due dates
- Set priority levels (Low, Medium, High)
- Mark tasks as completed
- Filter tasks by status

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/<id>` - Get specific client
- `POST /api/clients` - Create new client
- `PUT /api/clients/<id>` - Update client
- `DELETE /api/clients/<id>` - Delete client

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/<id>` - Update contact
- `DELETE /api/contacts/<id>` - Delete contact

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create new activity
- `PUT /api/activities/<id>` - Update activity
- `DELETE /api/activities/<id>` - Delete activity

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

### Statistics
- `GET /api/stats` - Get dashboard statistics

## Database Schema

The application uses SQLite with the following models:
- **Client**: name, email, phone, company, address, status
- **Contact**: client_id, name, email, phone, position, notes
- **Activity**: client_id, type, subject, description, date
- **Task**: title, description, due_date, status, priority

## Development

The application is built with simplicity and functionality in mind:
- No external CSS frameworks - custom responsive CSS
- Vanilla JavaScript - no frontend framework dependencies
- RESTful API design
- SQLite for easy setup and portability

## Copyright Notice

This software is the proprietary property of Julio Cesar Mendez Tobar.
Unauthorized copying, distribution, modification, or use is strictly prohibited.

For licensing inquiries, please contact the author.

## License

**Proprietary Software License**

Copyright (c) 2024-2026 Julio Cesar Mendez Tobar. All Rights Reserved.

This software and associated documentation files (the "Software") are the 
proprietary and confidential information of Julio Cesar Mendez Tobar.

**You may NOT:**
- Copy, modify, or distribute the Software
- Reverse engineer, decompile, or disassemble the Software
- Remove or alter any copyright notices
- Use the Software for commercial purposes without a license

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

## Author

**Julio Cesar Mendez Tobar**
