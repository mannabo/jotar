// Simple Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    if (!form) {
        console.log('Contact form not found');
        return;
    }
    
    console.log('Contact form loaded successfully');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });
    
    function handleFormSubmit() {
        console.log('Form submit triggered');
        
        // Get form values
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        
        console.log('Form values:', { name, email, subject, message });
        
        // Validate
        if (!name || name.trim() === '') {
            showMessage('Please enter your name.', 'error');
            return;
        }
        
        if (!email || email.trim() === '') {
            showMessage('Please enter your email.', 'error');
            return;
        }
        
        if (!isValidEmail(email.trim())) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        if (!subject || subject.trim() === '') {
            showMessage('Please enter a subject.', 'error');
            return;
        }
        
        if (!message || message.trim() === '') {
            showMessage('Please enter your message.', 'error');
            return;
        }
        
        // Show loading
        setLoadingState(true);
        
        // Simulate sending
        setTimeout(function() {
            // Save message
            const messageData = {
                id: 'msg_' + Date.now(),
                name: name.trim(),
                email: email.trim(),
                subject: subject.trim(),
                message: message.trim(),
                timestamp: new Date().toISOString(),
                status: 'unread'
            };
            
            saveMessage(messageData);
            
            // Show success
            showMessage('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            form.reset();
            setLoadingState(false);
        }, 1500);
    }
    
    function saveMessage(messageData) {
        try {
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messages.unshift(messageData);
            
            if (messages.length > 100) {
                messages = messages.slice(0, 100);
            }
            
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            const unreadCount = messages.filter(msg => msg.status === 'unread').length;
            localStorage.setItem('unreadMessageCount', unreadCount.toString());
            
            console.log('Message saved successfully');
        } catch (error) {
            console.error('Error saving message:', error);
        }
    }
    
    function setLoadingState(loading) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        if (loading) {
            submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
    
    function showMessage(message, type) {
        if (!formMessage) return;
        
        formMessage.className = `form-message ${type}`;
        formMessage.textContent = message;
        formMessage.style.display = 'block';
        
        setTimeout(function() {
            formMessage.style.display = 'none';
        }, 5000);
        
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});