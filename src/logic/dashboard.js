// Dashboard functionality for PT Doven Tradeco
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
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
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // In a real app, you would clear session/tokens here
            window.location.href = 'index.html';
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Global logout function for onclick handlers
function logout() {
    const dashboard = new DashboardManager();
    dashboard.logout();
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
} 