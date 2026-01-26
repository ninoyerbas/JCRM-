// Dashboard functionality

async function loadStats() {
    try {
        const stats = await apiCall('/api/stats');
        
        document.getElementById('total-clients').textContent = stats.total_clients;
        document.getElementById('active-clients').textContent = stats.active_clients;
        document.getElementById('total-contacts').textContent = stats.total_contacts;
        document.getElementById('pending-tasks').textContent = stats.pending_tasks;
        
        displayRecentActivities(stats.recent_activities);
        displayUpcomingTasks(stats.upcoming_tasks);
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function displayRecentActivities(activities) {
    const container = document.getElementById('recent-activities');
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="empty-message">No recent activities</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="list-item">
            <div><strong>${activity.subject}</strong></div>
            <div><span class="badge badge-${activity.type}">${activity.type}</span></div>
            <div><small>${formatDate(activity.date)}</small></div>
        </div>
    `).join('');
}

function displayUpcomingTasks(tasks) {
    const container = document.getElementById('upcoming-tasks');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-message">No upcoming tasks</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="list-item">
            <div><strong>${task.title}</strong></div>
            <div><span class="badge badge-${task.priority}">${task.priority}</span></div>
            <div><small>Due: ${formatDateOnly(task.due_date)}</small></div>
        </div>
    `).join('');
}

// Load stats when page loads
document.addEventListener('DOMContentLoaded', loadStats);
