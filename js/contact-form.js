// Simple Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    if (!form) {
        console.error('Contact form with ID "contactForm" not found');
        return;
    }
    
    // Double check all required elements exist
    const requiredElements = [
        'contactName',
        'contactEmail', 
        'contactSubject',
        'contactMessage',
        'submitBtn',
        'formMessage'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required form elements:', missingElements);
        return;
    }
    
    console.log('Contact form loaded successfully with all required elements');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });
    
    async function handleFormSubmit() {
        console.log('Form submit triggered');
        
        // Get form elements first
        const nameEl = document.getElementById('contactName');
        const emailEl = document.getElementById('contactEmail');
        const subjectEl = document.getElementById('contactSubject');
        const messageEl = document.getElementById('contactMessage');
        
        // Check if elements exist
        if (!nameEl || !emailEl || !subjectEl || !messageEl) {
            console.error('Form elements not found:', {
                nameEl: !!nameEl,
                emailEl: !!emailEl, 
                subjectEl: !!subjectEl,
                messageEl: !!messageEl
            });
            showMessage('Form error: Elements not found. Please refresh page.', 'error');
            return;
        }
        
        // Get form values and trim whitespace
        const name = nameEl.value ? nameEl.value.trim() : '';
        const email = emailEl.value ? emailEl.value.trim() : '';
        const subject = subjectEl.value ? subjectEl.value.trim() : '';
        const message = messageEl.value ? messageEl.value.trim() : '';
        
        console.log('Form values:', { name, email, subject, message });
        console.log('Name length:', name.length, 'Name value:', JSON.stringify(name));
        
        // Validate form fields
        if (!name || name === '') {
            console.log('Name validation failed');
            showMessage('Please enter your name.', 'error');
            return;
        }
        
        if (!email || email === '') {
            console.log('Email validation failed');
            showMessage('Please enter your email.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            console.log('Email format validation failed');
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        if (!subject || subject === '') {
            console.log('Subject validation failed');
            showMessage('Please enter a subject.', 'error');
            return;
        }
        
        if (!message || message === '') {
            console.log('Message validation failed');
            showMessage('Please enter your message.', 'error');
            return;
        }
        
        // Save message to Firebase
        const messageData = {
            id: 'msg_' + Date.now(),
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'unread'
        };
        
        const result = await saveMessageToFirebase(messageData);
        
        if (result.success) {
            // Show success
            showMessage('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            form.reset();
        } else {
            // Show error
            showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        }
    }
    
    async function saveMessageToFirebase(messageData) {
        try {
            // Wait for Firebase handler to be ready
            if (window.firebaseMessages) {
                const result = await window.firebaseMessages.saveMessage(messageData);
                return result;
            } else {
                // Fallback to localStorage if Firebase not available
                console.log('Firebase not available, using localStorage fallback');
                return saveToLocalStorageFallback(messageData);
            }
        } catch (error) {
            console.error('Error saving message:', error);
            return saveToLocalStorageFallback(messageData);
        }
    }
    
    function saveToLocalStorageFallback(messageData) {
        try {
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messages.unshift(messageData);
            
            if (messages.length > 100) {
                messages = messages.slice(0, 100);
            }
            
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            const unreadCount = messages.filter(msg => msg.status === 'unread').length;
            localStorage.setItem('unreadMessageCount', unreadCount.toString());
            
            console.log('Message saved to localStorage fallback');
            return { success: true };
        } catch (error) {
            console.error('Error saving to localStorage fallback:', error);
            return { success: false, error: error.message };
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