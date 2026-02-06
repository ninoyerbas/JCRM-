/*
 * JCRM - Customer Relationship Management System
 * Copyright (c) 2024-2026 Julio Cesar Mendez Tobar. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software and associated documentation files (the "Software") are
 * the proprietary and confidential information of Julio Cesar Mendez Tobar.
 * 
 * Unauthorized copying, modification, distribution, or use of this software,
 * via any medium, is strictly prohibited without the express written permission
 * of the copyright holder.
 * 
 * Author: Julio Cesar Mendez Tobar
 */

// Contacts management functionality

let contacts = [];
let clients = [];
let editingContactId = null;

async function loadContacts() {
    try {
        contacts = await apiCall('/api/contacts');
        displayContacts();
    } catch (error) {
        console.error('Failed to load contacts:', error);
        document.getElementById('contacts-list').innerHTML = '<p class="empty-message">Failed to load contacts</p>';
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
    const select = document.getElementById('contact-client');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Select a client</option>' +
        clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
}

function displayContacts() {
    const container = document.getElementById('contacts-list');
    
    if (contacts.length === 0) {
        container.innerHTML = '<p class="empty-message">No contacts found</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Position</th>
                    <th>Client</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${contacts.map(contact => {
                    const client = clients.find(c => c.id === contact.client_id);
                    return `
                        <tr>
                            <td>${contact.name}</td>
                            <td>${contact.email || 'N/A'}</td>
                            <td>${contact.phone || 'N/A'}</td>
                            <td>${contact.position || 'N/A'}</td>
                            <td>${client ? client.name : 'Unknown'}</td>
                            <td>${formatDate(contact.created_at)}</td>
                            <td>
                                <button onclick="editContact(${contact.id})" class="btn btn-primary action-btn">Edit</button>
                                <button onclick="deleteContact(${contact.id})" class="btn btn-danger action-btn">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function showAddContactModal() {
    editingContactId = null;
    document.getElementById('modal-title').textContent = 'Add Contact';
    document.getElementById('contact-form').reset();
    document.getElementById('contact-id').value = '';
    document.getElementById('contact-modal').style.display = 'block';
}

function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    
    editingContactId = id;
    document.getElementById('modal-title').textContent = 'Edit Contact';
    document.getElementById('contact-id').value = contact.id;
    document.getElementById('contact-client').value = contact.client_id;
    document.getElementById('contact-name').value = contact.name;
    document.getElementById('contact-email').value = contact.email || '';
    document.getElementById('contact-phone').value = contact.phone || '';
    document.getElementById('contact-position').value = contact.position || '';
    document.getElementById('contact-notes').value = contact.notes || '';
    document.getElementById('contact-modal').style.display = 'block';
}

async function saveContact(event) {
    event.preventDefault();
    
    const data = {
        client_id: parseInt(document.getElementById('contact-client').value),
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        position: document.getElementById('contact-position').value,
        notes: document.getElementById('contact-notes').value
    };
    
    try {
        if (editingContactId) {
            await apiCall(`/api/contacts/${editingContactId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showMessage('Contact updated successfully');
        } else {
            await apiCall('/api/contacts', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showMessage('Contact added successfully');
        }
        
        closeContactModal();
        loadContacts();
    } catch (error) {
        console.error('Failed to save contact:', error);
        showMessage('Failed to save contact', 'error');
    }
}

async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
        await apiCall(`/api/contacts/${id}`, {
            method: 'DELETE'
        });
        showMessage('Contact deleted successfully');
        loadContacts();
    } catch (error) {
        console.error('Failed to delete contact:', error);
        showMessage('Failed to delete contact', 'error');
    }
}

function closeContactModal() {
    document.getElementById('contact-modal').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadClients().then(() => loadContacts());
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('contact-modal');
    if (event.target === modal) {
        closeContactModal();
    }
}
