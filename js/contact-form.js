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
    
    function handleFormSubmit() {
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
        
        // Get form values
        const name = nameEl.value;
        const email = emailEl.value;
        const subject = subjectEl.value;
        const message = messageEl.value;
        
        console.log('Form values:', { name, email, subject, message });
        
        // Validate form fields
        if (!name || name.trim() === '') {
            showMessage('Sila masukkan nama anda.', 'error');
            return;
        }
        
        if (!email || email.trim() === '') {
            showMessage('Sila masukkan email anda.', 'error');
            return;
        }
        
        if (!isValidEmail(email.trim())) {
            showMessage('Sila masukkan email yang sah.', 'error');
            return;
        }
        
        if (!subject || subject.trim() === '') {
            showMessage('Sila masukkan subjek.', 'error');
            return;
        }
        
        if (!message || message.trim() === '') {
            showMessage('Sila masukkan mesej anda.', 'error');
            return;
        }
        
        // Show loading
        setLoadingState(true);
        
        // Save message to Firebase
        setTimeout(async function() {
            const messageData = {
                id: 'msg_' + Date.now(),
                name: name.trim(),
                email: email.trim(),
                subject: subject.trim(),
                message: message.trim(),
                timestamp: new Date().toISOString(),
                status: 'unread'
            };
            
            const result = await saveMessageToFirebase(messageData);
            
            if (result.success) {
                // Show success
                showMessage('Terima kasih! Mesej anda telah berjaya dihantar.', 'success');
                
                // Reset form
                form.reset();
            } else {
                // Show error
                showMessage('Maaf, terdapat masalah menghantar mesej. Sila cuba lagi.', 'error');
            }
            
            setLoadingState(false);
        }, 1500);
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