// Admin Messages Handler
class AdminMessagesHandler {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.noMessages = document.getElementById('noMessages');
        this.totalMessagesEl = document.getElementById('totalMessages');
        this.unreadMessagesEl = document.getElementById('unreadMessages');
        this.todayMessagesEl = document.getElementById('todayMessages');
        
        // Button elements
        this.markAllReadBtn = document.getElementById('markAllReadBtn');
        this.clearMessagesBtn = document.getElementById('clearMessagesBtn');
        this.refreshMessagesBtn = document.getElementById('refreshMessagesBtn');
        
        // Notification badge in sidebar
        this.notificationBadge = document.querySelector('.notification-badge');
        
        this.init();
    }
    
    init() {
        // Load messages on page load
        this.loadMessages();
        
        // Event listeners
        if (this.markAllReadBtn) {
            this.markAllReadBtn.addEventListener('click', this.markAllRead.bind(this));
        }
        
        if (this.clearMessagesBtn) {
            this.clearMessagesBtn.addEventListener('click', this.clearAllMessages.bind(this));
        }
        
        if (this.refreshMessagesBtn) {
            this.refreshMessagesBtn.addEventListener('click', this.loadMessages.bind(this));
        }
        
        // Listen for message updates from main website
        window.addEventListener('messagesUpdated', this.handleMessagesUpdate.bind(this));
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadMessages();
        }, 30000);
    }
    
    async loadMessages() {
        const messages = await this.getMessages();
        this.renderMessages(messages);
        this.updateStats(messages);
        this.updateNotificationBadge(messages);
    }
    
    async getMessages() {
        try {
            if (window.firebaseMessages) {
                return await window.firebaseMessages.getMessages();
            } else {
                // Fallback to localStorage
                return JSON.parse(localStorage.getItem('contactMessages') || '[]');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            return [];
        }
    }
    
    renderMessages(messages) {
        if (messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="no-messages" id="noMessages">
                    <div class="no-messages-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3>No Messages Yet</h3>
                    <p>Contact messages from your website will appear here.</p>
                </div>
            `;
            return;
        }
        
        const messagesHTML = messages.map(message => this.createMessageHTML(message)).join('');
        this.messagesContainer.innerHTML = messagesHTML;
        
        // Add click listeners to message items
        this.addMessageClickListeners();
    }
    
    createMessageHTML(message) {
        const date = new Date(message.timestamp);
        const timeAgo = this.getTimeAgo(date);
        const isUnread = message.status === 'unread';
        
        return `
            <div class="message-item ${isUnread ? 'unread' : ''}" data-id="${message.id}">
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-sender">
                            <div class="sender-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="sender-info">
                                <h5>${this.escapeHtml(message.name)}</h5>
                                <p class="sender-email">${this.escapeHtml(message.email)}</p>
                            </div>
                        </div>
                        <div class="message-meta">
                            <span class="message-time">${timeAgo}</span>
                            ${isUnread ? '<span class="unread-indicator">NEW</span>' : ''}
                        </div>
                    </div>
                    <div class="message-subject">
                        <strong>Subject:</strong> ${this.escapeHtml(message.subject)}
                    </div>
                    <div class="message-preview">
                        ${this.escapeHtml(message.message.substring(0, 150))}${message.message.length > 150 ? '...' : ''}
                    </div>
                </div>
                <div class="message-actions">
                    <button class="btn-icon mark-read-btn" title="Mark as Read" data-id="${message.id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon delete-btn" title="Delete Message" data-id="${message.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon view-btn" title="View Full Message" data-id="${message.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    addMessageClickListeners() {
        // Mark as read buttons
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAsRead(btn.dataset.id);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteMessage(btn.dataset.id);
            });
        });
        
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewMessage(btn.dataset.id);
            });
        });
        
        // Message item clicks
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => {
                this.viewMessage(item.dataset.id);
            });
        });
    }
    
    async markAsRead(messageId) {
        try {
            if (window.firebaseMessages) {
                await window.firebaseMessages.updateMessageStatus(messageId, 'read');
            } else {
                // Fallback to localStorage
                const messages = await this.getMessages();
                const messageIndex = messages.findIndex(msg => msg.id === messageId);
                
                if (messageIndex !== -1) {
                    messages[messageIndex].status = 'read';
                    localStorage.setItem('contactMessages', JSON.stringify(messages));
                }
            }
            this.loadMessages();
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }
    
    markAllRead() {
        if (!confirm('Mark all messages as read?')) return;
        
        const messages = this.getMessages();
        const updatedMessages = messages.map(msg => ({ ...msg, status: 'read' }));
        localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
        this.loadMessages();
    }
    
    async deleteMessage(messageId) {
        if (!confirm('Delete this message permanently?')) return;
        
        try {
            if (window.firebaseMessages) {
                await window.firebaseMessages.deleteMessage(messageId);
            } else {
                // Fallback to localStorage
                const messages = await this.getMessages();
                const filteredMessages = messages.filter(msg => msg.id !== messageId);
                localStorage.setItem('contactMessages', JSON.stringify(filteredMessages));
            }
            this.loadMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }
    
    clearAllMessages() {
        if (!confirm('Delete all messages permanently? This action cannot be undone.')) return;
        
        localStorage.removeItem('contactMessages');
        localStorage.removeItem('unreadMessageCount');
        this.loadMessages();
    }
    
    viewMessage(messageId) {
        const messages = this.getMessages();
        const message = messages.find(msg => msg.id === messageId);
        
        if (!message) return;
        
        // Mark as read when viewing
        if (message.status === 'unread') {
            this.markAsRead(messageId);
        }
        
        // Create modal for viewing full message
        this.showMessageModal(message);
    }
    
    showMessageModal(message) {
        const date = new Date(message.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const modalHTML = `
            <div class="message-modal-overlay" id="messageModal">
                <div class="message-modal">
                    <div class="modal-header">
                        <h3>Message Details</h3>
                        <button class="close-modal" id="closeModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="message-detail">
                            <label>From:</label>
                            <p>${this.escapeHtml(message.name)} (${this.escapeHtml(message.email)})</p>
                        </div>
                        <div class="message-detail">
                            <label>Subject:</label>
                            <p>${this.escapeHtml(message.subject)}</p>
                        </div>
                        <div class="message-detail">
                            <label>Date:</label>
                            <p>${formattedDate}</p>
                        </div>
                        <div class="message-detail">
                            <label>Message:</label>
                            <div class="message-full-text">${this.escapeHtml(message.message).replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="replyBtn">
                            <i class="fas fa-reply"></i>
                            Reply via Email
                        </button>
                        <button class="btn btn-danger" id="deleteModalBtn">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        document.getElementById('closeModal').addEventListener('click', this.closeModal);
        document.getElementById('messageModal').addEventListener('click', (e) => {
            if (e.target.id === 'messageModal') this.closeModal();
        });
        
        document.getElementById('replyBtn').addEventListener('click', () => {
            window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, '_blank');
        });
        
        document.getElementById('deleteModalBtn').addEventListener('click', () => {
            this.deleteMessage(message.id);
            this.closeModal();
        });
    }
    
    closeModal() {
        const modal = document.getElementById('messageModal');
        if (modal) modal.remove();
    }
    
    updateStats(messages) {
        const total = messages.length;
        const unread = messages.filter(msg => msg.status === 'unread').length;
        
        // Calculate today's messages
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = messages.filter(msg => {
            const msgDate = new Date(msg.timestamp);
            msgDate.setHours(0, 0, 0, 0);
            return msgDate.getTime() === today.getTime();
        }).length;
        
        this.totalMessagesEl.textContent = total;
        this.unreadMessagesEl.textContent = unread;
        this.todayMessagesEl.textContent = todayCount;
    }
    
    updateNotificationBadge(messages) {
        const unreadCount = messages.filter(msg => msg.status === 'unread').length;
        
        if (this.notificationBadge) {
            if (unreadCount > 0) {
                this.notificationBadge.textContent = unreadCount;
                this.notificationBadge.style.display = 'inline';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }
    }
    
    handleMessagesUpdate(event) {
        // Handle real-time updates from main website
        this.loadMessages();
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminMessagesHandler();
});