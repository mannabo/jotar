document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const phone = formData.get('phone').trim();
        
        if (validateForm(name, email, phone)) {
            submitForm(name, email, phone);
        }
    });
    
    function validateForm(name, email, phone) {
        let isValid = true;
        
        if (!name || name.length < 2) {
            showError('name', 'Sila masukkan nama penuh yang sah');
            isValid = false;
        } else {
            clearError('name');
        }
        
        if (!isValidEmail(email)) {
            showError('email', 'Sila masukkan alamat email yang sah');
            isValid = false;
        } else {
            clearError('email');
        }
        
        if (!isValidPhone(phone)) {
            showError('phone', 'Sila masukkan nombor telefon yang sah');
            isValid = false;
        } else {
            clearError('phone');
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
        const cleanPhone = phone.replace(/[\s-]/g, '');
        return phoneRegex.test(cleanPhone) || /^[0-9]{10,11}$/.test(cleanPhone);
    }
    
    function showError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const existingError = field.parentNode.querySelector('.error-message');
        
        if (existingError) {
            existingError.textContent = message;
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '0.85rem';
            errorDiv.style.marginTop = '5px';
            field.parentNode.appendChild(errorDiv);
        }
        
        field.style.borderColor = '#e74c3c';
    }
    
    function clearError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorMessage = field.parentNode.querySelector('.error-message');
        
        if (errorMessage) {
            errorMessage.remove();
        }
        
        field.style.borderColor = '#e1e5e9';
    }
    
    function submitForm(name, email, phone) {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Menghantar...';
        submitBtn.disabled = true;
        
        const registrationData = {
            name: name,
            email: email,
            phone: phone,
            timestamp: new Date().toISOString(),
            seminar: 'AI Seminar - JOTAR Group'
        };
        
        console.log('Registration data:', registrationData);
        
        setTimeout(() => {
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            localStorage.setItem('jotar_registration', JSON.stringify(registrationData));
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }
    
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearError(this.id);
        });
        
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value) {
                if (this.type === 'email' && !isValidEmail(value)) {
                    showError(this.id, 'Format email tidak sah');
                } else if (this.type === 'tel' && !isValidPhone(value)) {
                    showError(this.id, 'Format nombor telefon tidak sah');
                }
            }
        });
    });
    
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.startsWith('60')) {
            value = '+' + value;
        } else if (value.startsWith('01')) {
            value = '+6' + value;
        } else if (value.length > 0 && !value.startsWith('0') && !value.startsWith('+')) {
            value = '0' + value;
        }
        
        this.value = value;
    });
});