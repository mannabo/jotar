import { loginUser, loginWithGoogle, checkAuthState, sendPasswordReset } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const togglePassword = document.getElementById('togglePassword');
    const rememberMe = document.getElementById('rememberMe');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    
    // Forgot password elements
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotModal = document.getElementById('closeForgotModal');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const sendResetBtn = document.getElementById('sendResetBtn');
    const resetEmailInput = document.getElementById('resetEmail');
    const modalError = document.getElementById('modalError');
    const modalErrorText = document.getElementById('modalErrorText');
    const modalSuccess = document.getElementById('modalSuccess');
    const modalSuccessText = document.getElementById('modalSuccessText');

    // Check if user is already logged in
    checkAuthState((user) => {
        if (user) {
            // User is logged in, redirect to dashboard
            window.location.href = './index.html';
        }
    });

    // Password toggle functionality
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Form validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateForm() {
        let isValid = true;
        
        // Reset previous validation states
        emailInput.classList.remove('error', 'success');
        passwordInput.classList.remove('error', 'success');
        
        // Validate email
        if (!emailInput.value.trim()) {
            emailInput.classList.add('error');
            showError('Email is required');
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            emailInput.classList.add('error');
            showError('Please enter a valid email address');
            isValid = false;
        } else {
            emailInput.classList.add('success');
        }
        
        // Validate password
        if (!passwordInput.value) {
            passwordInput.classList.add('error');
            if (isValid) showError('Password is required');
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            passwordInput.classList.add('error');
            if (isValid) showError('Password must be at least 6 characters');
            isValid = false;
        } else {
            passwordInput.classList.add('success');
        }
        
        return isValid;
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function showLoading() {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    }

    function hideLoading() {
        loginBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        hideError();
        
        if (!validateForm()) {
            return;
        }
        
        showLoading();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        try {
            const result = await loginUser(email, password);
            
            if (result.success) {
                // Save remember me preference
                if (rememberMe.checked) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('userEmail', email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('userEmail');
                }
                
                // Show success message
                showSuccess('Login successful! Redirecting...');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 1500);
                
            } else {
                let errorMsg = 'Login failed. Please try again.';
                
                // Handle specific Firebase error codes
                if (result.error.includes('user-not-found')) {
                    errorMsg = 'No account found with this email address.';
                } else if (result.error.includes('wrong-password')) {
                    errorMsg = 'Incorrect password. Please try again.';
                } else if (result.error.includes('invalid-email')) {
                    errorMsg = 'Invalid email address format.';
                } else if (result.error.includes('too-many-requests')) {
                    errorMsg = 'Too many failed attempts. Please try again later.';
                } else if (result.error.includes('user-disabled')) {
                    errorMsg = 'This account has been disabled.';
                }
                
                showError(errorMsg);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An unexpected error occurred. Please try again.');
        } finally {
            hideLoading();
        }
    });

    function showSuccess(message) {
        // Remove error message if visible
        hideError();
        
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Insert before error message
        errorMessage.parentNode.insertBefore(successDiv, errorMessage);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    // Load remembered email
    function loadRememberedEmail() {
        if (localStorage.getItem('rememberMe') === 'true') {
            const savedEmail = localStorage.getItem('userEmail');
            if (savedEmail) {
                emailInput.value = savedEmail;
                rememberMe.checked = true;
            }
        }
    }

    // Input field enhancements
    function addInputEnhancements() {
        [emailInput, passwordInput].forEach(input => {
            input.addEventListener('focus', function() {
                hideError();
                this.classList.remove('error');
            });
            
            input.addEventListener('input', function() {
                this.classList.remove('error', 'success');
            });
        });
        
        // Enter key support
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }


    // Google Sign-In Handler
    googleSignInBtn.addEventListener('click', async function() {
        hideError();
        
        // Disable both buttons during Google sign-in
        googleSignInBtn.disabled = true;
        loginBtn.disabled = true;
        
        const originalText = googleSignInBtn.innerHTML;
        googleSignInBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Signing in...</span>
        `;
        
        try {
            const result = await loginWithGoogle();
            
            if (result.success) {
                showSuccess('Google sign-in successful! Redirecting...');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 1500);
                
            } else {
                let errorMsg = 'Google sign-in failed. Please try again.';
                
                if (result.error.includes('popup-closed-by-user')) {
                    errorMsg = 'Sign-in cancelled. Please try again.';
                } else if (result.error.includes('popup-blocked')) {
                    errorMsg = 'Popup blocked. Please allow popups and try again.';
                } else if (result.error.includes('network-request-failed')) {
                    errorMsg = 'Network error. Please check your connection.';
                }
                
                showError(errorMsg);
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            showError('An unexpected error occurred during Google sign-in.');
        } finally {
            // Re-enable buttons and restore original text
            googleSignInBtn.disabled = false;
            loginBtn.disabled = false;
            googleSignInBtn.innerHTML = originalText;
        }
    });

    // Forgot Password Modal Functions
    function showModal() {
        forgotPasswordModal.style.display = 'flex';
        resetEmailInput.focus();
        hideModalMessages();
        resetEmailInput.value = emailInput.value; // Pre-fill with login email if available
    }

    function hideModal() {
        forgotPasswordModal.style.display = 'none';
        resetEmailInput.value = '';
        hideModalMessages();
    }

    function showModalError(message) {
        modalErrorText.textContent = message;
        modalError.style.display = 'flex';
        modalSuccess.style.display = 'none';
    }

    function showModalSuccess(message) {
        modalSuccessText.textContent = message;
        modalSuccess.style.display = 'flex';
        modalError.style.display = 'none';
    }

    function hideModalMessages() {
        modalError.style.display = 'none';
        modalSuccess.style.display = 'none';
    }

    // Forgot Password Event Listeners
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showModal();
    });

    closeForgotModal.addEventListener('click', hideModal);
    cancelResetBtn.addEventListener('click', hideModal);

    // Close modal when clicking outside
    forgotPasswordModal.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            hideModal();
        }
    });

    // Send Password Reset
    sendResetBtn.addEventListener('click', async function() {
        const email = resetEmailInput.value.trim();

        if (!email) {
            showModalError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            showModalError('Please enter a valid email address');
            return;
        }

        // Show loading
        const originalText = sendResetBtn.innerHTML;
        sendResetBtn.innerHTML = `
            <div class="btn-loader" style="display: flex;">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <span>Sending...</span>
        `;
        sendResetBtn.disabled = true;

        try {
            const result = await sendPasswordReset(email);

            if (result.success) {
                showModalSuccess(`Password reset email sent to ${email}. Please check your inbox and follow the instructions.`);
                
                // Auto-close modal after 3 seconds
                setTimeout(() => {
                    hideModal();
                }, 3000);
            } else {
                let errorMsg = 'Failed to send reset email. Please try again.';
                
                if (result.error.includes('user-not-found')) {
                    errorMsg = 'No account found with this email address.';
                } else if (result.error.includes('invalid-email')) {
                    errorMsg = 'Invalid email address format.';
                } else if (result.error.includes('too-many-requests')) {
                    errorMsg = 'Too many requests. Please wait before trying again.';
                }
                
                showModalError(errorMsg);
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showModalError('An unexpected error occurred. Please try again.');
        } finally {
            sendResetBtn.innerHTML = originalText;
            sendResetBtn.disabled = false;
        }
    });

    // Enter key support in reset email field
    resetEmailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendResetBtn.click();
        }
    });

    // Initialize
    loadRememberedEmail();
    addInputEnhancements();
    
    // Focus on email input
    emailInput.focus();
    
    console.log('Login page initialized successfully!');
});