// Clients management functionality

let clients = [];
let editingClientId = null;

async function loadClients() {
    try {
        const search = document.getElementById('search-input').value;
        const status = document.getElementById('status-filter').value;
        
        let url = '/api/clients';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (params.toString()) url += '?' + params.toString();
        
        clients = await apiCall(url);
        displayClients();
    } catch (error) {
        console.error('Failed to load clients:', error);
        document.getElementById('clients-list').innerHTML = '<p class="empty-message">Failed to load clients</p>';
    }
}

function displayClients() {
    const container = document.getElementById('clients-list');
    
    if (clients.length === 0) {
        container.innerHTML = '<p class="empty-message">No clients found</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${clients.map(client => `
                    <tr>
                        <td>${client.name}</td>
                        <td>${client.email}</td>
                        <td>${client.phone || 'N/A'}</td>
                        <td>${client.company || 'N/A'}</td>
                        <td><span class="badge badge-${client.status}">${client.status}</span></td>
                        <td>${formatDate(client.created_at)}</td>
                        <td>
                            <button onclick="editClient(${client.id})" class="btn btn-primary action-btn">Edit</button>
                            <button onclick="deleteClient(${client.id})" class="btn btn-danger action-btn">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function showAddClientModal() {
    editingClientId = null;
    document.getElementById('modal-title').textContent = 'Add Client';
    document.getElementById('client-form').reset();
    document.getElementById('client-id').value = '';
    document.getElementById('client-modal').style.display = 'block';
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    editingClientId = id;
    document.getElementById('modal-title').textContent = 'Edit Client';
    document.getElementById('client-id').value = client.id;
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email;
    document.getElementById('client-phone').value = client.phone || '';
    document.getElementById('client-company').value = client.company || '';
    document.getElementById('client-address').value = client.address || '';
    document.getElementById('client-status').value = client.status;
    document.getElementById('client-modal').style.display = 'block';
}

async function saveClient(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        phone: document.getElementById('client-phone').value,
        company: document.getElementById('client-company').value,
        address: document.getElementById('client-address').value,
        status: document.getElementById('client-status').value
    };
    
    try {
        if (editingClientId) {
            await apiCall(`/api/clients/${editingClientId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showMessage('Client updated successfully');
        } else {
            await apiCall('/api/clients', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showMessage('Client added successfully');
        }
        
        closeClientModal();
        loadClients();
    } catch (error) {
        console.error('Failed to save client:', error);
        showMessage('Failed to save client', 'error');
    }
}

async function deleteClient(id) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
        await apiCall(`/api/clients/${id}`, {
            method: 'DELETE'
        });
        showMessage('Client deleted successfully');
        loadClients();
    } catch (error) {
        console.error('Failed to delete client:', error);
        showMessage('Failed to delete client', 'error');
    }
}

function closeClientModal() {
    document.getElementById('client-modal').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    
    document.getElementById('search-input').addEventListener('input', loadClients);
    document.getElementById('status-filter').addEventListener('change', loadClients);
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('client-modal');
    if (event.target === modal) {
        closeClientModal();
    }
}
