// Tasks management functionality

const DESCRIPTION_TRUNCATE_LENGTH = 50;

let tasks = [];
let editingTaskId = null;

async function loadTasks() {
    try {
        const status = document.getElementById('status-filter').value;
        
        let url = '/api/tasks';
        if (status) url += `?status=${status}`;
        
        tasks = await apiCall(url);
        displayTasks();
    } catch (error) {
        console.error('Failed to load tasks:', error);
        document.getElementById('tasks-list').innerHTML = '<p class="empty-message">Failed to load tasks</p>';
    }
}

function displayTasks() {
    const container = document.getElementById('tasks-list');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-message">No tasks found</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tasks.map(task => `
                    <tr>
                        <td>${task.title}</td>
                        <td>${task.description ? task.description.substring(0, DESCRIPTION_TRUNCATE_LENGTH) + '...' : 'N/A'}</td>
                        <td>${formatDateOnly(task.due_date)}</td>
                        <td><span class="badge badge-${task.priority}">${task.priority}</span></td>
                        <td><span class="badge badge-${task.status}">${task.status}</span></td>
                        <td>
                            ${task.status === 'pending' ? 
                                `<button onclick="completeTask(${task.id})" class="btn btn-success action-btn">Complete</button>` : 
                                ''}
                            <button onclick="editTask(${task.id})" class="btn btn-primary action-btn">Edit</button>
                            <button onclick="deleteTask(${task.id})" class="btn btn-danger action-btn">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function showAddTaskModal() {
    editingTaskId = null;
    document.getElementById('modal-title').textContent = 'Add Task';
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-modal').style.display = 'block';
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-due-date').value = task.due_date || '';
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-modal').style.display = 'block';
}

async function saveTask(event) {
    event.preventDefault();
    
    const data = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        due_date: document.getElementById('task-due-date').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value
    };
    
    try {
        if (editingTaskId) {
            await apiCall(`/api/tasks/${editingTaskId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showMessage('Task updated successfully');
        } else {
            await apiCall('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showMessage('Task added successfully');
        }
        
        closeTaskModal();
        loadTasks();
    } catch (error) {
        console.error('Failed to save task:', error);
        showMessage('Failed to save task', 'error');
    }
}

async function completeTask(id) {
    try {
        await apiCall(`/api/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'completed' })
        });
        showMessage('Task marked as completed');
        loadTasks();
    } catch (error) {
        console.error('Failed to complete task:', error);
        showMessage('Failed to complete task', 'error');
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        await apiCall(`/api/tasks/${id}`, {
            method: 'DELETE'
        });
        showMessage('Task deleted successfully');
        loadTasks();
    } catch (error) {
        console.error('Failed to delete task:', error);
        showMessage('Failed to delete task', 'error');
    }
}

function closeTaskModal() {
    document.getElementById('task-modal').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    document.getElementById('status-filter').addEventListener('change', loadTasks);
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('task-modal');
    if (event.target === modal) {
        closeTaskModal();
    }
}
