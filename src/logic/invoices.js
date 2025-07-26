// Invoice management functionality for PT Doven Tradeco
class InvoiceManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedFiles = [];
        this.invoices = this.generateDummyInvoices();
        this.filteredInvoices = [...this.invoices];
        this.uploadResults = { successful: [], failed: [] };
        
        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return; // Stop initialization if not authenticated
        }
        
        this.setupEventListeners();
        this.renderInvoices();
        this.updatePagination();
    }

    generateDummyInvoices() {
        const customers = [
            'PT Maju Bersama', 'CV Sukses Mandiri', 'UD Makmur Jaya', 
            'PT Sejahtera Abadi', 'CV Berkah Sentosa', 'PT Indah Permai',
            'UD Jaya Makmur', 'CV Maju Jaya', 'PT Sukses Bersama',
            'UD Berkah Abadi', 'CV Indah Permai', 'PT Makmur Jaya'
        ];

        const statuses = ['paid', 'outstanding', 'overdue', 'draft'];
        const invoices = [];

        for (let i = 1; i <= 50; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = Math.floor(Math.random() * 50000) + 5000;
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            const dueDate = new Date(date);
            dueDate.setDate(dueDate.getDate() + 30);

            invoices.push({
                id: i,
                invoiceNumber: `INV-2024-${String(i).padStart(3, '0')}`,
                customer: customer,
                amount: amount,
                date: date.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                status: status
            });
        }

        return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterInvoices();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterInvoices();
            });
        }

        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFileSelection(e.dataTransfer.files);
            });
        }

        // Close dialog on outside click
        const uploadDialog = document.getElementById('uploadDialog');
        if (uploadDialog) {
            uploadDialog.addEventListener('click', (e) => {
                if (e.target === uploadDialog) {
                    this.closeUploadDialog();
                }
            });
        }

        // Close upload results dialog on outside click
        const uploadResultsDialog = document.getElementById('uploadResultsDialog');
        if (uploadResultsDialog) {
            uploadResultsDialog.addEventListener('click', (e) => {
                if (e.target === uploadResultsDialog) {
                    this.closeUploadResults();
                }
            });
        }

        // Export dialog event listeners
        this.setupExportEventListeners();
    }

    setupExportEventListeners() {
        // Close export dialog on outside click
        const exportDialog = document.getElementById('exportDialog');
        if (exportDialog) {
            exportDialog.addEventListener('click', (e) => {
                if (e.target === exportDialog) {
                    this.closeExportDialog();
                }
            });
        }

        // Export filter change listeners
        const exportDateFrom = document.getElementById('exportDateFrom');
        const exportDateTo = document.getElementById('exportDateTo');
        const exportStatusFilter = document.getElementById('exportStatusFilter');

        if (exportDateFrom) {
            exportDateFrom.addEventListener('change', () => {
                this.updateExportSummary();
                this.validateDateRange();
            });
            // Auto-show date picker on click
            exportDateFrom.addEventListener('click', () => {
                exportDateFrom.showPicker();
            });
        }

        if (exportDateTo) {
            exportDateTo.addEventListener('change', () => {
                this.updateExportSummary();
                this.validateDateRange();
            });
            // Auto-show date picker on click
            exportDateTo.addEventListener('click', () => {
                exportDateTo.showPicker();
            });
        }

        if (exportStatusFilter) {
            exportStatusFilter.addEventListener('change', () => {
                this.updateExportSummary();
            });
        }
    }

    filterInvoices() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredInvoices = this.invoices.filter(invoice => {
            const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
                                invoice.customer.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || invoice.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.currentPage = 1;
        this.renderInvoices();
        this.updatePagination();
    }

    renderInvoices() {
        const tbody = document.getElementById('invoiceTableBody');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageInvoices = this.filteredInvoices.slice(startIndex, endIndex);

        tbody.innerHTML = pageInvoices.map(invoice => `
            <tr>
                <td>${invoice.invoiceNumber}</td>
                <td>${invoice.customer}</td>
                <td>$${invoice.amount.toLocaleString()}</td>
                <td>${this.formatDate(invoice.date)}</td>
                <td>${this.formatDate(invoice.dueDate)}</td>
                <td><span class="status-badge status-${invoice.status}">${invoice.status}</span></td>
                <td>
                    <button class="action-btn view-btn" onclick="invoiceManager.viewInvoice(${invoice.id})" title="View Invoice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="action-btn edit-btn" onclick="invoiceManager.editInvoice(${invoice.id})" title="Edit Invoice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="invoiceManager.deleteInvoice(${invoice.id})" title="Delete Invoice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
        const currentPageElement = document.getElementById('currentPage');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (currentPageElement) {
            currentPageElement.textContent = this.currentPage;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderInvoices();
            this.updatePagination();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Upload Dialog Functions
    openUploadDialog() {
        const dialog = document.getElementById('uploadDialog');
        if (dialog) {
            dialog.classList.add('active');
            this.selectedFiles = [];
            this.updateUploadButton();
        }
    }

    closeUploadDialog() {
        const dialog = document.getElementById('uploadDialog');
        if (dialog) {
            dialog.classList.remove('active');
            this.selectedFiles = [];
            this.updateUploadButton();
            
            // Reset file input
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.value = '';
            }
        }
    }

    triggerFileInput() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleFileSelection(files) {
        this.selectedFiles = Array.from(files).filter(file => {
            const validTypes = ['application/pdf', 'text/plain']; // PDF and EDI (text/plain for .edi files)
            const validExtensions = ['.pdf', '.edi', '.PDF', '.EDI']; // Support both cases
            const maxSize = 10 * 1024 * 1024; // 10MB

            // Check file extension for EDI files (case-insensitive)
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            const fileExtensionUpper = '.' + file.name.split('.').pop().toUpperCase();
            const isValidType = validTypes.includes(file.type) || 
                               validExtensions.includes(fileExtension) || 
                               validExtensions.includes(fileExtensionUpper);

            if (!isValidType) {
                this.showCustomAlert('Invalid File Type', `Invalid file type: ${file.name}. Please select PDF or EDI files only.`, '❌');
                return false;
            }

            if (file.size > maxSize) {
                this.showCustomAlert('File Too Large', `File too large: ${file.name}. Maximum size is 10MB.`, '⚠️');
                return false;
            }

            return true;
        });

        this.updateUploadButton();
        this.updateUploadArea();
    }

    updateUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = this.selectedFiles.length === 0;
        }
    }

    updateUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        if (this.selectedFiles.length > 0) {
            uploadArea.innerHTML = `
                <div class="upload-icon">📄</div>
                <div class="upload-text">${this.selectedFiles.length} file(s) selected</div>
                <div class="upload-hint">
                    ${this.selectedFiles.map(file => file.name).join('<br>')}
                </div>
            `;
        } else {
            uploadArea.innerHTML = `
                <div class="upload-icon">📄</div>
                <div class="upload-text">Click to select or drag files here</div>
                <div class="upload-hint">Supports PDF and EDI files only (Max 10MB)</div>
            `;
        }
    }

    uploadFiles() {
        if (this.selectedFiles.length === 0) return;

        // Reset upload results
        this.uploadResults = { successful: [], failed: [] };

        // Simulate upload process
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.textContent = 'Uploading...';
            uploadBtn.disabled = true;
        }

        setTimeout(() => {
            // Simulate upload results with proper validation
            this.selectedFiles.forEach((file) => {
                // Check if file is actually valid (double-check validation)
                const validTypes = ['application/pdf', 'text/plain'];
                const validExtensions = ['.pdf', '.edi', '.PDF', '.EDI'];
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                const fileExtensionUpper = '.' + file.name.split('.').pop().toUpperCase();
                const isValidType = validTypes.includes(file.type) || 
                                   validExtensions.includes(fileExtension) || 
                                   validExtensions.includes(fileExtensionUpper);
                const maxSize = 10 * 1024 * 1024; // 10MB

                if (!isValidType) {
                    this.uploadResults.failed.push({
                        fileName: file.name,
                        reason: 'File format is not PDF nor EDI'
                    });
                } else if (file.size > maxSize) {
                    this.uploadResults.failed.push({
                        fileName: file.name,
                        reason: 'File size exceeds limit'
                    });
                } else {
                    // Simulate some random upload failures (like network issues) for demonstration
                    const randomFailure = Math.random() < 0.1; // 10% chance of random failure
                    if (randomFailure) {
                        this.uploadResults.failed.push({
                            fileName: file.name,
                            reason: 'Network error during upload'
                        });
                    } else {
                        this.uploadResults.successful.push({
                            fileName: file.name,
                            size: this.formatFileSize(file.size),
                            uploadTime: new Date().toLocaleTimeString()
                        });
                    }
                }
            });

            this.closeUploadDialog();
            this.showUploadResults();
            
            // Refresh the invoice list (in a real app, this would fetch new data)
            this.filterInvoices();
        }, 2000);
    }

    showUploadResults() {
        const resultsDialog = document.getElementById('uploadResultsDialog');
        if (resultsDialog) {
            resultsDialog.classList.add('active');
            this.updateResultsTables();
        }
    }

    closeUploadResults() {
        const resultsDialog = document.getElementById('uploadResultsDialog');
        if (resultsDialog) {
            resultsDialog.classList.remove('active');
        }
    }

    updateResultsTables() {
        const successfulTableBody = document.getElementById('successfulTableBody');
        const failedTableBody = document.getElementById('failedTableBody');
        const successfulCount = document.getElementById('successfulCount');
        const failedCount = document.getElementById('failedCount');
        const noSuccessfulResults = document.getElementById('noSuccessfulResults');
        const noFailedResults = document.getElementById('noFailedResults');

        // Update summary counts
        if (successfulCount) {
            successfulCount.textContent = this.uploadResults.successful.length;
        }
        if (failedCount) {
            failedCount.textContent = this.uploadResults.failed.length;
        }

        if (successfulTableBody) {
            if (this.uploadResults.successful.length > 0) {
                successfulTableBody.innerHTML = this.uploadResults.successful.map(file => `
                    <tr>
                        <td>${file.fileName}</td>
                        <td>${file.size}</td>
                        <td>${file.uploadTime}</td>
                    </tr>
                `).join('');
                if (noSuccessfulResults) noSuccessfulResults.style.display = 'none';
            } else {
                successfulTableBody.innerHTML = '';
                if (noSuccessfulResults) noSuccessfulResults.style.display = 'block';
            }
        }

        if (failedTableBody) {
            if (this.uploadResults.failed.length > 0) {
                failedTableBody.innerHTML = this.uploadResults.failed.map(file => `
                    <tr>
                        <td>${file.fileName}</td>
                        <td>${file.reason}</td>
                    </tr>
                `).join('');
                if (noFailedResults) noFailedResults.style.display = 'none';
            } else {
                failedTableBody.innerHTML = '';
                if (noFailedResults) noFailedResults.style.display = 'block';
            }
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Invoice Actions
    viewInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (invoice) {
            alert(`Viewing invoice: ${invoice.invoiceNumber}\nCustomer: ${invoice.customer}\nAmount: $${invoice.amount.toLocaleString()}`);
        }
    }

    editInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (invoice) {
            alert(`Editing invoice: ${invoice.invoiceNumber}`);
        }
    }

    deleteInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (invoice && confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
            this.invoices = this.invoices.filter(inv => inv.id !== id);
            this.filterInvoices();
            alert('Invoice deleted successfully!');
        }
    }

    // Logout functionality
    async logout() {
        console.log('Invoices logout method called');
        
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
                console.log('User confirmed logout, proceeding...');
                // Clear any stored session data
                this.clearSessionData();
                
                // Show logout message
                this.showSnackbar('Logging out...', 2000, '👋');
                
                // Redirect after a short delay to show the message
                setTimeout(() => {
                    console.log('Redirecting to login page...');
                    // Redirect to login page
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                console.log('User cancelled logout');
            }
        } catch (error) {
            console.error('Error with custom modal, using fallback:', error);
            // Fallback to browser confirm
            const confirmed = confirm('Are you sure you want to logout?\n\nYou will be redirected to the login page.');
            if (confirmed) {
                this.clearSessionData();
                this.showSnackbar('Logging out...', 2000, '👋');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
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

    // Custom Modal System
    showCustomModal(title, message, icon = '❓', type = 'confirm') {
        const modalOverlay = document.getElementById('customModalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalIcon = document.getElementById('modalIcon');
        const modalActions = document.getElementById('modalActions');

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
            
            // Store modal type (callback will be set by showCustomConfirm)
            this.modalType = type;
        }
    }

    showCustomConfirm(title, message, icon = '❓') {
        console.log('Invoices showCustomConfirm called, creating promise...');
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
        console.log('Invoices closeCustomModal method called');
        console.log('Current modal callback:', !!this.modalCallback);
        
        const modalOverlay = document.getElementById('customModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
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
        console.log('Invoices confirmCustomModal method called');
        console.log('Current modal callback:', !!this.modalCallback);
        
        const modalOverlay = document.getElementById('customModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
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

    // Export Dialog Functions
    openExportDialog() {
        const dialog = document.getElementById('exportDialog');
        if (dialog) {
            dialog.classList.add('active');
            this.updateExportSummary();
        }
    }

    closeExportDialog() {
        const dialog = document.getElementById('exportDialog');
        if (dialog) {
            dialog.classList.remove('active');
        }
    }

    updateExportSummary() {
        const filteredInvoices = this.getFilteredInvoicesForExport();
        const exportCount = document.getElementById('exportCount');
        const exportSummary = document.getElementById('exportSummary');
        const exportXMLBtn = document.getElementById('exportXMLBtn');

        if (exportCount) {
            exportCount.textContent = filteredInvoices.length;
        }

        if (exportSummary) {
            exportSummary.style.display = filteredInvoices.length > 0 ? 'block' : 'none';
        }

        if (exportXMLBtn) {
            exportXMLBtn.disabled = filteredInvoices.length === 0;
        }
    }

    validateDateRange() {
        const dateFrom = document.getElementById('exportDateFrom')?.value;
        const dateTo = document.getElementById('exportDateTo')?.value;
        const dateError = document.getElementById('dateError');
        const exportXMLBtn = document.getElementById('exportXMLBtn');
        const dateToInput = document.getElementById('exportDateTo');

        // Clear previous error state
        if (dateError) {
            dateError.style.display = 'none';
        }
        if (dateToInput) {
            dateToInput.classList.remove('error');
        }

        // Only validate if both dates are selected
        if (dateFrom && dateTo) {
            if (dateTo <= dateFrom) {
                // Show error
                if (dateError) {
                    dateError.style.display = 'block';
                }
                if (dateToInput) {
                    dateToInput.classList.add('error');
                }
                if (exportXMLBtn) {
                    exportXMLBtn.disabled = true;
                }
                return false;
            }
        }

        // Re-enable export button if validation passes
        if (exportXMLBtn) {
            const filteredInvoices = this.getFilteredInvoicesForExport();
            exportXMLBtn.disabled = filteredInvoices.length === 0;
        }

        return true;
    }

    getFilteredInvoicesForExport() {
        const dateFrom = document.getElementById('exportDateFrom')?.value;
        const dateTo = document.getElementById('exportDateTo')?.value;
        const statusFilter = document.getElementById('exportStatusFilter')?.value;

        // Return empty array if date validation fails
        if (dateFrom && dateTo && dateTo <= dateFrom) {
            return [];
        }

        return this.invoices.filter(invoice => {
            // Date range filter
            if (dateFrom && invoice.date < dateFrom) return false;
            if (dateTo && invoice.date > dateTo) return false;

            // Status filter
            if (statusFilter && invoice.status !== statusFilter) return false;

            return true;
        });
    }

    exportToXML() {
        const filteredInvoices = this.getFilteredInvoicesForExport();
        if (filteredInvoices.length === 0) return;

        // Generate DJP XML content
        const xmlContent = this.generateDJPXML(filteredInvoices);
        
        // Create and download the file
        this.downloadXMLFile(xmlContent);
        
        // Close the dialog
        this.closeExportDialog();
    }

    generateDJPXML(invoices) {
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            timeZone: 'Asia/Jakarta' 
        });

        let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<efaktur:PKP>
    <efaktur:header>
        <efaktur:versi>1.0</efaktur:versi>
        <efaktur:npwp>12.345.678.9-012.345</efaktur:npwp>
        <efaktur:nama>PT Doven Tradeco</efaktur:nama>
        <efaktur:alamat>Jl. Sudirman No. 123, Jakarta Pusat</efaktur:alamat>
        <efaktur:telepon>021-1234567</efaktur:telepon>
        <efaktur:email>info@ptdoven.com</efaktur:email>
        <efaktur:tanggal_upload>${currentDate}T${currentTime}</efaktur:tanggal_upload>
        <efaktur:jumlah_data>${invoices.length}</efaktur:jumlah_data>
    </efaktur:header>
    <efaktur:data>`;

        invoices.forEach((invoice, index) => {
            const invoiceDate = new Date(invoice.date);
            const dueDate = new Date(invoice.dueDate);
            
            xmlContent += `
        <efaktur:faktur>
            <efaktur:nomor_faktur>${invoice.invoiceNumber}</efaktur:nomor_faktur>
            <efaktur:tanggal_faktur>${invoice.date}</efaktur:tanggal_faktur>
            <efaktur:jatuh_tempo>${invoice.dueDate}</efaktur:jatuh_tempo>
            <efaktur:nama_pembeli>${invoice.customer}</efaktur:nama_pembeli>
            <efaktur:npwp_pembeli>00.000.000.0-000.000</efaktur:npwp_pembeli>
            <efaktur:alamat_pembeli>Alamat ${invoice.customer}</efaktur:alamat_pembeli>
            <efaktur:jumlah_dpp>${invoice.amount}</efaktur:jumlah_dpp>
            <efaktur:jumlah_ppn>${Math.round(invoice.amount * 0.11)}</efaktur:jumlah_ppn>
            <efaktur:jumlah_total>${Math.round(invoice.amount * 1.11)}</efaktur:jumlah_total>
            <efaktur:status>${this.mapStatusToDJP(invoice.status)}</efaktur:status>
        </efaktur:faktur>`;
        });

        xmlContent += `
    </efaktur:data>
</efaktur:PKP>`;

        return xmlContent;
    }

    mapStatusToDJP(status) {
        const statusMap = {
            'paid': 'LUNAS',
            'outstanding': 'BELUM_LUNAS',
            'overdue': 'JATUH_TEMPO',
            'draft': 'DRAFT'
        };
        return statusMap[status] || 'BELUM_LUNAS';
    }

    downloadXMLFile(xmlContent) {
        // Create a blob with the XML content
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DJP_Export_${new Date().toISOString().split('T')[0]}.xml`;
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Show success snackbar
        this.showSnackbar('DJP XML file exported successfully!', 4000, '📄');
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
}

// Initialize invoice manager when DOM is loaded
let invoiceManager;
document.addEventListener('DOMContentLoaded', () => {
    invoiceManager = new InvoiceManager();
});

// Global functions for onclick handlers
function openUploadDialog() {
    if (invoiceManager) {
        invoiceManager.openUploadDialog();
    }
}

function closeUploadDialog() {
    if (invoiceManager) {
        invoiceManager.closeUploadDialog();
    }
}

function triggerFileInput() {
    if (invoiceManager) {
        invoiceManager.triggerFileInput();
    }
}

function uploadFiles() {
    if (invoiceManager) {
        invoiceManager.uploadFiles();
    }
}

function closeUploadResults() {
    if (invoiceManager) {
        invoiceManager.closeUploadResults();
    }
}

function openExportDialog() {
    if (invoiceManager) {
        invoiceManager.openExportDialog();
    }
}

function closeExportDialog() {
    if (invoiceManager) {
        invoiceManager.closeExportDialog();
    }
}

function exportToXML() {
    if (invoiceManager) {
        invoiceManager.exportToXML();
    }
}

function closeSnackbar() {
    if (invoiceManager) {
        invoiceManager.hideSnackbar();
    }
}

function closeCustomModal() {
    console.log('Global closeCustomModal called');
    if (invoiceManager) {
        invoiceManager.closeCustomModal();
    } else {
        console.error('invoiceManager not found!');
    }
}

function confirmCustomModal() {
    console.log('Global confirmCustomModal called');
    if (invoiceManager) {
        invoiceManager.confirmCustomModal();
    } else {
        console.error('invoiceManager not found!');
    }
}

function changePage(direction) {
    if (invoiceManager) {
        invoiceManager.changePage(direction);
    }
}

function logout() {
    console.log('Global logout function called');
    if (invoiceManager) {
        invoiceManager.logout();
    } else {
        console.error('invoiceManager not found!');
    }
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvoiceManager;
}