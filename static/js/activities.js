// Activities management functionality

let activities = [];
let clients = [];
let editingActivityId = null;

async function loadActivities() {
    try {
        activities = await apiCall('/api/activities');
        displayActivities();
    } catch (error) {
        console.error('Failed to load activities:', error);
        document.getElementById('activities-list').innerHTML = '<p class="empty-message">Failed to load activities</p>';
    }
}

async function loadClients() {
    try {
        clients = await apiCall('/api/clients');
        populateClientDropdown();
    } catch (error) {
        console.error('Failed to load clients:', error);
    }
}

function populateClientDropdown() {
    const select = document.getElementById('activity-client');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Select a client</option>' +
        clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
}

function displayActivities() {
    const container = document.getElementById('activities-list');
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="empty-message">No activities found</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${activities.map(activity => {
                    const client = clients.find(c => c.id === activity.client_id);
                    return `
                        <tr>
                            <td><span class="badge badge-${activity.type}">${activity.type}</span></td>
                            <td>${activity.subject}</td>
                            <td>${client ? client.name : 'Unknown'}</td>
                            <td>${formatDate(activity.date)}</td>
                            <td>${activity.description ? activity.description.substring(0, 50) + '...' : 'N/A'}</td>
                            <td>
                                <button onclick="editActivity(${activity.id})" class="btn btn-primary action-btn">Edit</button>
                                <button onclick="deleteActivity(${activity.id})" class="btn btn-danger action-btn">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function showAddActivityModal() {
    editingActivityId = null;
    document.getElementById('modal-title').textContent = 'Add Activity';
    document.getElementById('activity-form').reset();
    document.getElementById('activity-id').value = '';
    
    // Set default date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('activity-date').value = now.toISOString().slice(0, 16);
    
    document.getElementById('activity-modal').style.display = 'block';
}

function editActivity(id) {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;
    
    editingActivityId = id;
    document.getElementById('modal-title').textContent = 'Edit Activity';
    document.getElementById('activity-id').value = activity.id;
    document.getElementById('activity-client').value = activity.client_id;
    document.getElementById('activity-type').value = activity.type;
    document.getElementById('activity-subject').value = activity.subject;
    document.getElementById('activity-description').value = activity.description || '';
    
    // Convert to local datetime-local format
    const date = new Date(activity.date);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    document.getElementById('activity-date').value = date.toISOString().slice(0, 16);
    
    document.getElementById('activity-modal').style.display = 'block';
}

async function saveActivity(event) {
    event.preventDefault();
    
    const data = {
        client_id: parseInt(document.getElementById('activity-client').value),
        type: document.getElementById('activity-type').value,
        subject: document.getElementById('activity-subject').value,
        description: document.getElementById('activity-description').value,
        date: document.getElementById('activity-date').value
    };
    
    try {
        if (editingActivityId) {
            await apiCall(`/api/activities/${editingActivityId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showMessage('Activity updated successfully');
        } else {
            await apiCall('/api/activities', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showMessage('Activity added successfully');
        }
        
        closeActivityModal();
        loadActivities();
    } catch (error) {
        console.error('Failed to save activity:', error);
        showMessage('Failed to save activity', 'error');
    }
}

async function deleteActivity(id) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
        await apiCall(`/api/activities/${id}`, {
            method: 'DELETE'
        });
        showMessage('Activity deleted successfully');
        loadActivities();
    } catch (error) {
        console.error('Failed to delete activity:', error);
        showMessage('Failed to delete activity', 'error');
    }
}

function closeActivityModal() {
    document.getElementById('activity-modal').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadClients().then(() => loadActivities());
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('activity-modal');
    if (event.target === modal) {
        closeActivityModal();
    }
}
