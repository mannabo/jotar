// Contact Form Handler
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.formMessage = document.getElementById('formMessage');
        this.btnText = this.submitBtn.querySelector('.btn-text');
        this.btnLoading = this.submitBtn.querySelector('.btn-loading');
        
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Get form data using direct element access
        const messageData = {
            id: this.generateId(),
            name: document.getElementById('contactName').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            subject: document.getElementById('contactSubject').value.trim(),
            message: document.getElementById('contactMessage').value.trim(),
            timestamp: new Date().toISOString(),
            status: 'unread'
        };
        
        // Validate form
        if (!this.validateForm(messageData)) {
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate sending delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Save message to localStorage
            this.saveMessage(messageData);
            
            // Show success message
            this.showMessage('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            this.form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    validateForm(data) {
        // Debug log
        console.log('Form data for validation:', data);
        
        // Basic validation
        if (!data.name || data.name.length === 0) {
            this.showMessage('Please enter your name.', 'error');
            return false;
        }
        
        if (!data.email || data.email.length === 0 || !this.isValidEmail(data.email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return false;
        }
        
        if (!data.subject || data.subject.length === 0) {
            this.showMessage('Please enter a subject.', 'error');
            return false;
        }
        
        if (!data.message || data.message.length === 0) {
            this.showMessage('Please enter your message.', 'error');
            return false;
        }
        
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    generateId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    saveMessage(messageData) {
        // Get existing messages from localStorage
        let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        
        // Add new message to the beginning of array
        messages.unshift(messageData);
        
        // Keep only last 100 messages
        if (messages.length > 100) {
            messages = messages.slice(0, 100);
        }
        
        // Save back to localStorage
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Update message counter for admin
        this.updateMessageCounter();
    }
    
    updateMessageCounter() {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const unreadCount = messages.filter(msg => msg.status === 'unread').length;
        
        // Store unread count for admin panel
        localStorage.setItem('unreadMessageCount', unreadCount.toString());
        
        // Dispatch custom event for admin panel
        window.dispatchEvent(new CustomEvent('messagesUpdated', {
            detail: { unreadCount }
        }));
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.btnText.style.display = 'none';
            this.btnLoading.style.display = 'inline-flex';
        } else {
            this.submitBtn.disabled = false;
            this.btnText.style.display = 'inline';
            this.btnLoading.style.display = 'none';
        }
    }
    
    showMessage(message, type) {
        this.formMessage.className = `form-message ${type}`;
        this.formMessage.textContent = message;
        this.formMessage.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.formMessage.style.display = 'none';
        }, 5000);
        
        // Scroll to message
        this.formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});