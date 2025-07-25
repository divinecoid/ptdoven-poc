// Login functionality for PT Doven Tradeco
class LoginManager {
    constructor() {
        this.passwordToggle = document.getElementById('passwordToggle');
        this.passwordInput = document.getElementById('password');
        this.loginForm = document.getElementById('loginForm');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        
        this.init();
    }

    init() {
        this.setupPasswordToggle();
        this.setupFormSubmission();
        this.setupInteractiveEffects();
    }

    setupPasswordToggle() {
        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', () => {
                const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                this.passwordInput.setAttribute('type', type);
                
                const eyeIcon = this.passwordToggle.querySelector('.eye-icon');
                const eyeOffIcon = this.passwordToggle.querySelector('.eye-off-icon');
                
                if (type === 'password') {
                    eyeIcon.style.display = 'block';
                    eyeOffIcon.style.display = 'none';
                } else {
                    eyeIcon.style.display = 'none';
                    eyeOffIcon.style.display = 'block';
                }
            });
        }
    }

    setupFormSubmission() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Hide any existing messages
        this.hideMessages();

        // Basic validation
        if (!username || !password) {
            this.showError('Please fill in all fields.');
            return;
        }

        // Simulate login process
        this.showSuccess('Logging in...');
        
        // Simulate API call delay
        setTimeout(() => {
            // Hardcoded credentials for POC: admin/admin
            if (username === 'admin' && password === 'admin') {
                this.showSuccess('Login successful! Redirecting...');
                // Here you would typically redirect to the main application
                setTimeout(() => {
                    alert('Welcome to PT Doven Tradeco!');
                }, 1000);
            } else {
                this.showError('Invalid credentials. Please use admin/admin for POC.');
            }
        }, 1500);
    }

    setupInteractiveEffects() {
        document.addEventListener('DOMContentLoaded', () => {
            const inputs = document.querySelectorAll('input');
            
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.parentElement.style.transform = 'scale(1.02)';
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.style.transform = 'scale(1)';
                });
            });
        });
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            this.successMessage.style.display = 'none';
        }
    }

    showSuccess(message) {
        if (this.successMessage) {
            this.successMessage.textContent = message;
            this.successMessage.style.display = 'block';
            this.errorMessage.style.display = 'none';
        }
    }

    hideMessages() {
        if (this.errorMessage) this.errorMessage.style.display = 'none';
        if (this.successMessage) this.successMessage.style.display = 'none';
    }

    forgotPassword() {
        alert('Password reset functionality would be implemented here.');
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginManager;
} 