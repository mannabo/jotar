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
        this.headerNotificationCount = document.querySelector('.notification-count');
        
        // Notification states
        this.lastUnreadCount = 0;
        this.hasPermission = false;
        
        this.init();
    }
    
    init() {
        // Request notification permission
        this.requestNotificationPermission();
        
        // Load messages on page load
        this.loadMessages();
        
        // Setup real-time Firebase listener
        this.setupFirebaseListener();
        
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
        
        // Auto-refresh every 30 seconds as fallback
        setInterval(() => {
            this.loadMessages();
        }, 30000);
    }
    
    async loadMessages() {
        const messages = await this.getMessages();
        this.renderMessages(messages);
        this.updateStats(messages);
        this.updateNotificationBadge(messages);
        this.checkForNewMessages(messages);
    }
    
    async getMessages() {
        try {
            if (window.firebaseMessages) {
                return await window.firebaseMessages.getMessages();
            } else {
                console.error('Firebase messages handler not available');
                return [];
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
                const result = await window.firebaseMessages.updateMessageStatus(messageId, 'read');
                if (result.success) {
                    this.loadMessages();
                } else {
                    console.error('Failed to mark message as read:', result.error);
                }
            } else {
                console.error('Firebase messages handler not available');
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }
    
    async markAllRead() {
        if (!confirm('Mark all messages as read?')) return;
        
        try {
            const messages = await this.getMessages();
            const unreadMessages = messages.filter(msg => msg.status === 'unread');
            
            if (window.firebaseMessages) {
                for (const message of unreadMessages) {
                    await window.firebaseMessages.updateMessageStatus(message.firebaseId || message.id, 'read');
                }
                this.loadMessages();
            } else {
                console.error('Firebase messages handler not available');
            }
        } catch (error) {
            console.error('Error marking all messages as read:', error);
        }
    }
    
    async deleteMessage(messageId) {
        if (!confirm('Delete this message permanently?')) return;
        
        try {
            if (window.firebaseMessages) {
                const result = await window.firebaseMessages.deleteMessage(messageId);
                if (result.success) {
                    this.loadMessages();
                } else {
                    console.error('Failed to delete message:', result.error);
                }
            } else {
                console.error('Firebase messages handler not available');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }
    
    async clearAllMessages() {
        if (!confirm('Delete all messages permanently? This action cannot be undone.')) return;
        
        try {
            const messages = await this.getMessages();
            
            if (window.firebaseMessages) {
                for (const message of messages) {
                    await window.firebaseMessages.deleteMessage(message.firebaseId || message.id);
                }
                this.loadMessages();
            } else {
                console.error('Firebase messages handler not available');
            }
        } catch (error) {
            console.error('Error clearing all messages:', error);
        }
    }
    
    async viewMessage(messageId) {
        const messages = await this.getMessages();
        const message = messages.find(msg => (msg.firebaseId || msg.id) === messageId);
        
        if (!message) return;
        
        // Mark as read when viewing
        if (message.status === 'unread') {
            this.markAsRead(message.firebaseId || message.id);
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
        
        // Update sidebar badge
        if (this.notificationBadge) {
            if (unreadCount > 0) {
                this.notificationBadge.textContent = unreadCount;
                this.notificationBadge.style.display = 'inline';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }
        
        // Update header notification count
        if (this.headerNotificationCount) {
            if (unreadCount > 0) {
                this.headerNotificationCount.textContent = unreadCount;
                this.headerNotificationCount.style.display = 'inline';
            } else {
                this.headerNotificationCount.style.display = 'none';
            }
        }
        
        // Update page title with notification count
        this.updatePageTitle(unreadCount);
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
    
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === 'granted';
            console.log('Notification permission:', permission);
        }
    }
    
    async setupFirebaseListener() {
        try {
            if (window.firebaseMessages && window.firebaseMessages.setupRealTimeListener) {
                const unsubscribe = await window.firebaseMessages.setupRealTimeListener((messages) => {
                    console.log('Real-time Firebase update received:', messages.length, 'messages');
                    this.renderMessages(messages);
                    this.updateStats(messages);
                    this.updateNotificationBadge(messages);
                    this.checkForNewMessages(messages);
                });
                console.log('Firebase real-time listener setup successfully');
            } else {
                console.log('Firebase real-time listener not available, using polling fallback');
            }
        } catch (error) {
            console.error('Error setting up Firebase listener:', error);
        }
    }
    
    checkForNewMessages(messages) {
        const currentUnreadCount = messages.filter(msg => msg.status === 'unread').length;
        
        // Check if there are new unread messages
        if (currentUnreadCount > this.lastUnreadCount && this.lastUnreadCount > 0) {
            const newMessagesCount = currentUnreadCount - this.lastUnreadCount;
            this.showNewMessageNotification(newMessagesCount, messages);
        }
        
        this.lastUnreadCount = currentUnreadCount;
    }
    
    showNewMessageNotification(count, messages) {
        // Browser notification
        if (this.hasPermission) {
            const latestMessage = messages.find(msg => msg.status === 'unread');
            const title = count === 1 ? 'New Message Received' : `${count} New Messages Received`;
            const body = latestMessage ? 
                `From: ${latestMessage.name}\nSubject: ${latestMessage.subject}` : 
                'You have new contact messages';
            
            const notification = new Notification(title, {
                body: body,
                icon: '../jotar-logo.png',
                badge: '../jotar-logo.png',
                tag: 'new-message',
                requireInteraction: true
            });
            
            notification.onclick = () => {
                window.focus();
                // Switch to messages section if not already there
                const messageSection = document.querySelector('[data-section="message"]');
                if (messageSection) {
                    messageSection.click();
                }
                notification.close();
            };
            
            // Auto close after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);
        }
        
        // In-app notification
        this.showInAppNotification(count);
        
        // Play notification sound
        this.playNotificationSound();
    }
    
    showInAppNotification(count) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-envelope"></i>
                <span>${count === 1 ? 'New message received!' : `${count} new messages received!`}</span>
                <button class="close-notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .in-app-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #28a745;
                    color: white;
                    padding: 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 350px;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .close-notification {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    margin-left: auto;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto close after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }
    
    playNotificationSound() {
        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }
    
    updatePageTitle(unreadCount) {
        const baseTitle = 'JOTAR Admin Dashboard';
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminMessagesHandler();
});