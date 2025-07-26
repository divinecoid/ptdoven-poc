// Dashboard functionality for PT Doven Tradeco
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return; // Stop initialization if not authenticated
        }
        
        this.setupCharts();
        this.setupEventListeners();
        this.updateStats();
    }

    setupCharts() {
        this.createRevenueChart();
        this.createInvoiceChart();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const revenueData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue',
                data: [185000, 210000, 195000, 230000, 245000, 280000, 265000, 290000, 310000, 285000, 320000, 2847392],
                borderColor: 'rgba(74, 144, 226, 1)',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(74, 144, 226, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: revenueData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            callback: function(value) {
                                return '$' + (value / 1000) + 'k';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: 'rgba(74, 144, 226, 1)'
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    }

    createInvoiceChart() {
        const ctx = document.getElementById('invoiceChart');
        if (!ctx) return;

        const invoiceData = {
            labels: ['Paid', 'Outstanding', 'Overdue'],
            datasets: [{
                data: [1247, 156, 23],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(244, 67, 54, 0.8)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(244, 67, 54, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 4
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: invoiceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                cutout: '60%',
                layout: {
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Chart period buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                chartBtns.forEach(b => b.style.background = 'rgba(255, 255, 255, 0.2)');
                e.target.style.background = 'rgba(255, 255, 255, 0.4)';
                this.updateChartData(e.target.textContent);
            });
        });

        // Navigation menu
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.textContent.includes('Logout')) return;
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // View all invoices button
        const viewAllBtn = document.querySelector('.view-all-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                alert('View All Invoices functionality would be implemented here.');
            });
        }
    }

    updateChartData(period) {
        // This would update chart data based on selected period
        console.log(`Updating chart data for: ${period}`);
    }

    updateStats() {
        // Animate stat numbers on load
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(stat => {
            const finalValue = stat.textContent;
            const isCurrency = finalValue.includes('$');
            const isNumber = !isNaN(parseFloat(finalValue.replace(/[$,]/g, '')));
            
            if (isNumber) {
                const numericValue = parseFloat(finalValue.replace(/[$,]/g, ''));
                this.animateNumber(stat, 0, numericValue, isCurrency);
            }
        });
    }

    animateNumber(element, start, end, isCurrency) {
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * this.easeOutQuart(progress);
            
            if (isCurrency) {
                element.textContent = '$' + this.formatNumber(Math.floor(current));
            } else {
                element.textContent = this.formatNumber(Math.floor(current));
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Logout functionality
    async logout() {
        console.log('Logout method called');
        
        try {
            console.log('About to show custom confirmation dialog...');
            // Show custom confirmation dialog
            const confirmed = await this.showCustomConfirm(
                'Logout Confirmation',
                'Are you sure you want to logout?\n\nYou will be redirected to the login page.',
                '🚪'
            );
            
            console.log('Confirmation result received:', confirmed);
            console.log('Confirmation result type:', typeof confirmed);
            
            if (confirmed) {
                console.log('User confirmed logout, calling performLogout...');
                this.performLogout();
            } else {
                console.log('User cancelled logout');
            }
        } catch (error) {
            console.error('Error with custom modal, using fallback:', error);
            // Fallback to browser confirm
            const confirmed = confirm('Are you sure you want to logout?\n\nYou will be redirected to the login page.');
            if (confirmed) {
                this.performLogout();
            }
        }
    }

    performLogout() {
        console.log('performLogout method called');
        
        // Clear any stored session data
        console.log('Clearing session data...');
        this.clearSessionData();
        
        // Show logout message
        console.log('Showing logout message...');
        this.showLogoutMessage();
        
        // Redirect after a short delay to show the message
        console.log('Setting up redirect timer...');
        setTimeout(() => {
            console.log('Redirecting to login page...');
            window.location.href = 'index.html';
        }, 1500);
    }

    // Custom Modal System for Dashboard
    showCustomModal(title, message, icon = '❓', type = 'confirm') {
        console.log('showCustomModal called with:', { title, message, icon, type });
        
        // Try to find existing modal elements
        let modalOverlay = document.getElementById('customModalOverlay');
        let modalTitle = document.getElementById('modalTitle');
        let modalMessage = document.getElementById('modalMessage');
        let modalIcon = document.getElementById('modalIcon');
        let modalActions = document.getElementById('modalActions');

        console.log('Modal elements found:', {
            modalOverlay: !!modalOverlay,
            modalTitle: !!modalTitle,
            modalMessage: !!modalMessage,
            modalIcon: !!modalIcon,
            modalActions: !!modalActions
        });

        // If modal elements don't exist, create them dynamically
        if (!modalOverlay) {
            console.log('Creating modal dynamically');
            this.createDynamicModal();
            
            // Get the newly created elements
            modalOverlay = document.getElementById('customModalOverlay');
            modalTitle = document.getElementById('modalTitle');
            modalMessage = document.getElementById('modalMessage');
            modalIcon = document.getElementById('modalIcon');
            modalActions = document.getElementById('modalActions');
        }

        if (modalOverlay && modalTitle && modalMessage && modalIcon && modalActions) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalIcon.textContent = icon;

            // Configure actions based on type
            if (type === 'alert') {
                modalActions.innerHTML = '<button class="btn btn-primary" onclick="closeCustomModal()">OK</button>';
            } else {
                modalActions.innerHTML = `
                    <button class="btn btn-secondary" onclick="closeCustomModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="confirmCustomModal()">Confirm</button>
                `;
            }

            modalOverlay.classList.add('show');
            console.log('Modal shown successfully');
            
            // Store modal type (callback will be set by showCustomConfirm)
            this.modalType = type;
        } else {
            console.error('Failed to create or find modal elements!');
            // Fallback to browser alert
            const result = confirm(`${title}\n\n${message}`);
            if (this.modalCallback) {
                this.modalCallback(result);
                this.modalCallback = null;
            }
        }
    }

    createDynamicModal() {
        // Remove any existing dynamic modal
        const existingModal = document.getElementById('customModalOverlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'customModalOverlay';
        modalOverlay.className = 'custom-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 4000;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 30px;
            width: 90%;
            max-width: 400px;
            color: white;
            transform: scale(0.8);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;

        const modalTitle = document.createElement('h3');
        modalTitle.id = 'modalTitle';
        modalTitle.className = 'modal-title';
        modalTitle.style.cssText = `
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: white;
        `;
        modalTitle.textContent = 'Confirmation';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        `;
        closeBtn.textContent = '×';
        closeBtn.onclick = () => this.closeCustomModal();

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            text-align: center;
            margin: 20px 0;
        `;

        const modalIcon = document.createElement('div');
        modalIcon.id = 'modalIcon';
        modalIcon.style.cssText = `
            font-size: 48px;
            margin-bottom: 15px;
            display: flex;
            justify-content: center;
        `;
        modalIcon.textContent = '❓';

        const modalMessage = document.createElement('div');
        modalMessage.id = 'modalMessage';
        modalMessage.style.cssText = `
            font-size: 16px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 10px;
        `;
        modalMessage.textContent = 'Are you sure you want to proceed?';

        modalContent.appendChild(modalIcon);
        modalContent.appendChild(modalMessage);

        // Create modal actions
        const modalActions = document.createElement('div');
        modalActions.id = 'modalActions';
        modalActions.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 25px;
        `;

        modalActions.innerHTML = `
            <button class="btn btn-secondary" onclick="closeCustomModal()">Cancel</button>
            <button class="btn btn-primary" onclick="confirmCustomModal()">Confirm</button>
        `;

        // Assemble modal
        modal.appendChild(modalHeader);
        modal.appendChild(modalContent);
        modal.appendChild(modalActions);
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        console.log('Dynamic modal created successfully');
    }

    showCustomConfirm(title, message, icon = '❓') {
        console.log('showCustomConfirm called, creating promise...');
        return new Promise((resolve) => {
            console.log('Storing modal callback...');
            this.modalCallback = resolve;
            console.log('Modal callback stored:', !!this.modalCallback);
            this.showCustomModal(title, message, icon, 'confirm');
        });
    }

    showCustomAlert(title, message, icon = 'ℹ️') {
        this.showCustomModal(title, message, icon, 'alert');
    }

    closeCustomModal() {
        console.log('closeCustomModal method called');
        console.log('Current modal callback:', !!this.modalCallback);
        
        const modalOverlay = document.getElementById('customModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
            // Add animation for dynamic modal
            const modal = modalOverlay.querySelector('.custom-modal');
            if (modal) {
                modal.style.transform = 'scale(0.8)';
                modal.style.opacity = '0';
            }
            console.log('Modal hidden');
            
            // Remove dynamic modal after animation
            setTimeout(() => {
                if (modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay);
                }
            }, 300);
        }
        
        // Resolve with false for cancel
        if (this.modalCallback) {
            console.log('Resolving modal with false (cancel)');
            this.modalCallback(false);
            this.modalCallback = null;
            console.log('Modal callback cleared');
        } else {
            console.log('No modal callback found for close');
        }
    }

    confirmCustomModal() {
        console.log('confirmCustomModal method called');
        console.log('Current modal callback:', !!this.modalCallback);
        
        const modalOverlay = document.getElementById('customModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
            // Add animation for dynamic modal
            const modal = modalOverlay.querySelector('.custom-modal');
            if (modal) {
                modal.style.transform = 'scale(0.8)';
                modal.style.opacity = '0';
            }
            console.log('Modal hidden');
            
            // Remove dynamic modal after animation
            setTimeout(() => {
                if (modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay);
                }
            }, 300);
        }
        
        // Resolve with true for confirm
        if (this.modalCallback) {
            console.log('Resolving modal with true (confirm)');
            this.modalCallback(true);
            this.modalCallback = null;
            console.log('Modal callback cleared');
        } else {
            console.log('No modal callback found for confirm');
        }
    }

    clearSessionData() {
        // Clear any stored data (localStorage, sessionStorage, etc.)
        try {
            // Clear authentication data
            localStorage.removeItem('userSession');
            localStorage.removeItem('userData');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('currentUser');
            
            // Clear session storage
            sessionStorage.clear();
            
            // Clear any cookies if they exist
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            console.log('Session data cleared successfully');
        } catch (error) {
            console.log('Session cleanup completed');
        }
    }

    showLogoutMessage() {
        // Use the snackbar system instead of creating a temporary message
        this.showSnackbar('Logging out...', 2000, '👋');
    }

    showSnackbar(message, duration = 4000, icon = '✅') {
        const snackbar = document.getElementById('snackbar');
        const snackbarMessage = document.getElementById('snackbarMessage');
        const snackbarIcon = document.getElementById('snackbarIcon');
        
        if (snackbar && snackbarMessage && snackbarIcon) {
            snackbarMessage.textContent = message;
            snackbarIcon.textContent = icon;
            snackbar.classList.add('show');
            
            // Auto-hide after duration
            setTimeout(() => {
                this.hideSnackbar();
            }, duration);
        }
    }

    hideSnackbar() {
        const snackbar = document.getElementById('snackbar');
        if (snackbar) {
            snackbar.classList.remove('show');
        }
    }

    // Check if user is authenticated
    checkAuthentication() {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const currentUser = localStorage.getItem('currentUser');
        
        if (!isAuthenticated || !currentUser) {
            // Redirect to login if not authenticated
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
}

// Initialize dashboard when DOM is loaded
let dashboardManager;
document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
    window.dashboardManager = dashboardManager;
});

// Global logout function for onclick handlers
function logout() {
    if (dashboardManager) {
        dashboardManager.logout();
    }
}

// Global functions for custom modal
function closeCustomModal() {
    console.log('closeCustomModal called');
    if (window.dashboardManager) {
        window.dashboardManager.closeCustomModal();
    } else {
        console.error('dashboardManager not found!');
    }
}

function confirmCustomModal() {
    console.log('confirmCustomModal called');
    if (window.dashboardManager) {
        window.dashboardManager.confirmCustomModal();
    } else {
        console.error('dashboardManager not found!');
    }
}

function closeSnackbar() {
    if (window.dashboardManager) {
        window.dashboardManager.hideSnackbar();
    }
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
} 