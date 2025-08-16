// === BANK UPLOAD POC ===
// Data structure in localStorage: { files: [ { id, name, uploadDate, rekening, nama, periode, mutasi: [ ... ] } ] }

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isAuthenticated || !currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Check authentication first
if (!checkAuthentication()) {
    // Stop initialization if not authenticated
    console.log('User not authenticated, redirecting to login...');
} else {
    console.log('User authenticated, initializing bank page...');
}

function getBankData() {
    return JSON.parse(localStorage.getItem('bankUploads') || '{"files":[]}');
}
function setBankData(data) {
    localStorage.setItem('bankUploads', JSON.stringify(data));
}

// UI Elements - will be initialized in DOMContentLoaded
let clearDataBtn, tabPerFile, tabAllData, tabContentPerFile, tabContentAllData;
let fileTableBody, detailModalOverlay, detailModal, detailFileName;
let detailRekening, detailNama, detailPeriode, mutasiDetailBody, allDataBody;

// Detail pagination elements
let detailItemsPerPage, detailPaginationInfo, detailPrevBtn, detailNextBtn, detailPaginationPages;

// Detail pagination state
let detailCurrentPage = 1;
let detailItemsPerPageValue = 10;
let detailCurrentFileId = null;

// Custom modal callback
let modalCallback = null;

// Tab logic
function showTab(tab) {
    if (tab === 'perfile') {
        tabPerFile.classList.add('active');
        tabAllData.classList.remove('active');
        tabContentPerFile.classList.remove('hidden');
        tabContentAllData.classList.add('hidden');
    } else {
        tabPerFile.classList.remove('active');
        tabAllData.classList.add('active');
        tabContentPerFile.classList.add('hidden');
        tabContentAllData.classList.remove('hidden');
    }
}

// Upload logic - will be set up in DOMContentLoaded

// Initialize upload modal functionality
let selectedFiles = [];

// Global function for onclick handler
function openUploadDialog() {
    console.log('Global openUploadDialog() called');
    const uploadDialog = document.getElementById('uploadDialog');
    if (uploadDialog) {
        uploadDialog.classList.add('active');
        selectedFiles = [];
        updateUploadButton();
        updateUploadArea();
        console.log('✅ Upload dialog opened successfully');
    } else {
        console.error('❌ Upload dialog element not found');
    }
}

// Global function for onclick handler
function closeUploadDialog() {
    console.log('Global closeUploadDialog() called');
    const uploadDialog = document.getElementById('uploadDialog');
    if (uploadDialog) {
        uploadDialog.classList.remove('active');
        selectedFiles = [];
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        updateUploadButton();
        updateUploadArea();
        console.log('✅ Upload dialog closed successfully');
    } else {
        console.error('❌ Upload dialog element not found');
    }
}

// Global function for onclick handler
function triggerFileInput() {
    console.log('Global triggerFileInput() called');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        console.log('File input element found, clicking...');
        try {
            fileInput.click();
            console.log('✅ File input clicked successfully');
        } catch (error) {
            console.error('❌ Error clicking file input:', error);
        }
    } else {
        console.error('❌ File input element not found');
    }
}

function updateUploadButton() {
    const uploadBtn = document.getElementById('uploadFilesBtn');
    uploadBtn.disabled = selectedFiles.length === 0;
}

function updateUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadText = uploadArea.querySelector('.upload-text');
    const uploadHint = uploadArea.querySelector('.upload-hint');
    
    if (selectedFiles.length > 0) {
        uploadText.textContent = `${selectedFiles.length} file(s) selected`;
        uploadHint.textContent = selectedFiles.map(f => f.name).join(', ');
    } else {
        uploadText.textContent = 'Click to select or drag files here';
        uploadHint.textContent = 'Supports CSV files only';
    }
}

// Global function for onclick handler
function uploadFiles() {
    console.log('Global uploadFiles() called');
    if (selectedFiles.length === 0) {
        showSnackbar('❌', 'Please select files to upload');
        return;
    }

    // Validate files
    const supportedFormats = ['csv'];
    const invalidFiles = selectedFiles.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return !supportedFormats.includes(extension);
    });

    if (invalidFiles.length > 0) {
        showSnackbar('❌', `Unsupported file format(s): ${invalidFiles.map(f => f.name).join(', ')}. Only CSV files are supported.`);
        return;
    }

    // Process files
    showSnackbar('⏳', `Processing ${selectedFiles.length} file(s)...`);
    
    setTimeout(() => {
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const text = ev.target.result;
                const parsed = parseBankCSV(text);
                if (!parsed) {
                    showSnackbar('❌', `Format file tidak dikenali: ${file.name}`);
                    return;
                }
                saveBankFile(file.name, parsed);
            };
            reader.readAsText(file);
        });
        
        renderFileTable();
        renderAllDataTable();
        closeUploadDialog();
        showSnackbar('✅', `${selectedFiles.length} Bank file(s) processed successfully!`);
    }, 1000);
}

// Setup upload modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    clearDataBtn = document.getElementById('clearDataBtn');
    tabPerFile = document.getElementById('tabPerFile');
    tabAllData = document.getElementById('tabAllData');
    tabContentPerFile = document.getElementById('tabContentPerFile');
    tabContentAllData = document.getElementById('tabContentAllData');
    fileTableBody = document.getElementById('fileTableBody');
    detailModalOverlay = document.getElementById('detailModalOverlay');
    detailModal = document.getElementById('detailModal');
    detailFileName = document.getElementById('detailFileName');
    detailRekening = document.getElementById('detailRekening');
    detailNama = document.getElementById('detailNama');
    detailPeriode = document.getElementById('detailPeriode');
    mutasiDetailBody = document.getElementById('mutasiDetailBody');
    allDataBody = document.getElementById('allDataBody');

    // Initialize pagination elements
    detailItemsPerPage = document.getElementById('detailItemsPerPage');
    detailPaginationInfo = document.getElementById('detailPaginationInfo');
    detailPrevBtn = document.getElementById('detailPrevBtn');
    detailNextBtn = document.getElementById('detailNextBtn');
    detailPaginationPages = document.getElementById('detailPaginationPages');

    // Set up tab event listeners
    if (tabPerFile) tabPerFile.onclick = () => showTab('perfile');
    if (tabAllData) tabAllData.onclick = () => showTab('alldata');

    // Set up clear data button event listener
    if (clearDataBtn) {
        clearDataBtn.onclick = async () => {
            console.log('Clear data button clicked');
            try {
                const confirmed = await showCustomConfirm(
                    '🗑️ Hapus Data',
                    'Yakin ingin menghapus semua data upload?\n\nTindakan ini tidak dapat dibatalkan.',
                    '⚠️'
                );
                
                console.log('Clear data confirmation result:', confirmed);
                
                if (confirmed) {
                    console.log('User confirmed clear data, proceeding...');
                    localStorage.removeItem('bankUploads');
                    renderFileTable();
                    renderAllDataTable();
                    closeDetailModal();
                    showSnackbar('Semua data berhasil dihapus!', 'success');
                    console.log('✅ Bank data cleared successfully');
                } else {
                    console.log('User cancelled clear data');
                }
            } catch (error) {
                console.error('❌ Error with custom modal:', error);
                showSnackbar('Terjadi kesalahan saat menampilkan dialog konfirmasi', 'error');
            }
        };
    }

    // Set up upload button event listener
    const uploadBtn = document.getElementById('uploadBtn');
    console.log('Upload button element:', uploadBtn);
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            console.log('Upload button clicked');
            openUploadDialog();
        });
        console.log('Upload button event listener added successfully');
    } else {
        console.error('Upload button element not found');
    }

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    console.log('Upload area element:', uploadArea);
    console.log('File input element:', fileInput);

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            selectedFiles = Array.from(e.target.files);
            updateUploadButton();
            updateUploadArea();
        });
    }

    // Drag and drop events
    if (uploadArea) {
        console.log('✅ Upload area found, setting up event listeners');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            selectedFiles = files;
            if (fileInput) fileInput.files = e.dataTransfer.files;
            updateUploadButton();
            updateUploadArea();
        });

        // Click to select files
        uploadArea.addEventListener('click', (e) => {
            console.log('🖱️ Upload area clicked');
            e.preventDefault();
            e.stopPropagation();
            console.log('🔍 File input element:', fileInput);
            if (fileInput) {
                console.log('📋 File input properties:', {
                    type: fileInput.type,
                    accept: fileInput.accept,
                    multiple: fileInput.multiple,
                    disabled: fileInput.disabled,
                    style: fileInput.style.display
                });
                try {
                    console.log('🚀 Attempting to click file input...');
                    fileInput.click();
                    console.log('✅ File input clicked successfully');
                } catch (error) {
                    console.error('❌ Error clicking file input:', error);
                }
            } else {
                console.error('❌ File input not found');
            }
        });
        
        console.log('✅ Upload area event listeners set up successfully');
    } else {
        console.error('❌ Upload area not found');
    }

    // Initial render
    renderFileTable();
    renderAllDataTable();
    showTab('perfile');
});

// Clear data logic - will be set up in DOMContentLoaded

// CSV Parsing sesuai contoh
function parseBankCSV(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim());
    // Cari header info
    let rekening = '', nama = '', periode = '';
    for (let i = 0; i < 10; i++) {
        if (lines[i]?.startsWith('No. rekening')) rekening = lines[i].split(':')[1]?.trim() || '';
        if (lines[i]?.startsWith('Nama')) nama = lines[i].split(':')[1]?.trim() || '';
        if (lines[i]?.startsWith('Periode')) periode = lines[i].split(':')[1]?.trim() || '';
    }
    // Cari index header mutasi
    let headerIdx = lines.findIndex(l => l.startsWith('Tanggal Transaksi'));
    if (headerIdx === -1) return null;
    // Ambil kolom header
    const headers = lines[headerIdx].split(',').map(h => h.trim());
    // Ambil data mutasi
    let mutasi = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        if (!lines[i] || lines[i].startsWith('Saldo Awal')) break;
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 5) continue;
        mutasi.push({
            tanggal: cols[0],
            keterangan: cols[1],
            cabang: cols[2],
            jumlah: cols[3],
            saldo: cols[4],
            status: 'draft' // Tambahkan status default
        });
    }
    return { rekening, nama, periode, mutasi };
}
// Helper untuk parsing baris CSV (handle koma di dalam tanda kutip)
function parseCSVLine(line) {
    const result = [];
    let current = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
        else current += char;
    }
    result.push(current);
    return result;
}

// Simpan ke localStorage
function saveBankFile(filename, parsed) {
    const data = getBankData();
    const id = Date.now();
    data.files.push({
        id,
        name: filename,
        uploadDate: new Date().toLocaleString('id-ID'),
        rekening: parsed.rekening,
        nama: parsed.nama,
        periode: parsed.periode,
        mutasi: parsed.mutasi // Status sudah ada di parsing
    });
    setBankData(data);
}

// Render tabel file upload
function renderFileTable() {
    const data = getBankData();
    fileTableBody.innerHTML = '';
    data.files.forEach(file => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${file.name}</td>
            <td>${file.uploadDate}</td>
            <td>${file.rekening}</td>
            <td>${file.nama}</td>
            <td>${file.periode}</td>
            <td><button class="detail-btn" data-id="${file.id}">📋 Detail</button></td>
        `;
        fileTableBody.appendChild(tr);
    });
    // Event detail
    fileTableBody.querySelectorAll('.detail-btn').forEach(btn => {
        btn.onclick = function() {
            showFileDetail(btn);
        };
    });
}

// Show detail mutasi per file in modal
function showFileDetail(btn) {
    const fileId = btn.getAttribute('data-id');
    const data = getBankData();
    const file = data.files.find(f => f.id == fileId);
    if (!file) return;
    
    // Set current file ID for pagination
    detailCurrentFileId = fileId;
    detailCurrentPage = 1;
    
    // Populate modal with file info
    detailFileName.textContent = file.name;
    detailRekening.textContent = file.rekening;
    detailNama.textContent = file.nama;
    detailPeriode.textContent = file.periode;
    
    // Render paginated mutasi table
    renderDetailTable();
    
    // Show modal
    detailModalOverlay.classList.add('show');
}

// Global function for onclick handler
function closeDetailModal() {
    console.log('Global closeDetailModal() called');
    if (detailModalOverlay) {
        detailModalOverlay.classList.remove('show');
        detailCurrentPage = 1;
        console.log('✅ Detail modal closed successfully');
    } else {
        console.error('❌ Detail modal overlay element not found');
    }
}

// Render semua data mutasi (flat)
function renderAllDataTable() {
    const data = getBankData();
    allDataBody.innerHTML = '';
    data.files.forEach((file, fileIndex) => {
        file.mutasi.forEach((m, mutasiIndex) => {
            const tr = document.createElement('tr');
            const amountClass = m.jumlah.includes('CR') ? 'amount-cr' : 'amount-db';
            const statusClass = `status-${m.status || 'draft'}`;
            const statusText = m.status || 'draft';
            tr.innerHTML = `
                <td>${file.name}</td>
                <td>${m.tanggal}</td>
                <td class="col-keterangan">${m.keterangan}</td>
                <td>${m.cabang}</td>
                <td class="${amountClass}">${m.jumlah}</td>
                <td>${m.saldo}</td>
                <td class="${statusClass}">${statusText}</td>
                <td class="col-aksi">
                    <button class="action-btn confirm" onclick="updateMutasiStatus(${file.id}, ${mutasiIndex}, 'confirmed')">✓ Confirm</button>
                    <button class="action-btn reject" onclick="updateMutasiStatus(${file.id}, ${mutasiIndex}, 'reject')">✗ Reject</button>
                    <button class="action-btn edit" onclick="updateMutasiStatus(${file.id}, ${mutasiIndex}, 'edited')">✎ Edit</button>
                </td>
            `;
            allDataBody.appendChild(tr);
        });
    });
}

// Global function for onclick handler
function updateMutasiStatus(fileId, mutasiIndex, newStatus) {
    console.log(`Global updateMutasiStatus() called: fileId=${fileId}, mutasiIndex=${mutasiIndex}, newStatus=${newStatus}`);
    const data = getBankData();
    const file = data.files.find(f => f.id == fileId);
    if (!file || !file.mutasi[mutasiIndex]) {
        console.error('❌ File or mutasi not found');
        return;
    }
    
    file.mutasi[mutasiIndex].status = newStatus;
    setBankData(data);
    
    // Check if detail modal is currently open
    const isDetailOpen = detailModalOverlay && detailModalOverlay.classList.contains('show');
    
    // Refresh tables
    renderFileTable();
    renderAllDataTable();
    
    // If detail modal was open and it's the same file, refresh it
    if (isDetailOpen && detailCurrentFileId == fileId) {
        renderDetailTable();
    }
    
    showSnackbar(`Status berhasil diubah menjadi: ${newStatus}`, 'success');
    console.log('✅ Mutasi status updated successfully');
}

// Render detail table with pagination
function renderDetailTable() {
    if (!detailCurrentFileId) return;
    
    const data = getBankData();
    const file = data.files.find(f => f.id == detailCurrentFileId);
    if (!file) return;
    
    const totalItems = file.mutasi.length;
    const totalPages = Math.ceil(totalItems / detailItemsPerPageValue);
    
    // Adjust current page if it exceeds total pages
    if (detailCurrentPage > totalPages) {
        detailCurrentPage = totalPages || 1;
    }
    
    // Calculate start and end indices
    const startIndex = (detailCurrentPage - 1) * detailItemsPerPageValue;
    const endIndex = Math.min(startIndex + detailItemsPerPageValue, totalItems);
    
    // Update pagination info
    detailPaginationInfo.textContent = `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems} data`;
    
    // Update pagination buttons
    detailPrevBtn.disabled = detailCurrentPage <= 1;
    detailNextBtn.disabled = detailCurrentPage >= totalPages;
    
    // Generate pagination pages
    renderDetailPaginationPages(totalPages);
    
    // Render table rows
    mutasiDetailBody.innerHTML = '';
    const paginatedMutasi = file.mutasi.slice(startIndex, endIndex);
    
    paginatedMutasi.forEach((m, index) => {
        const actualIndex = startIndex + index; // Real index in the original array
        const tr = document.createElement('tr');
        const amountClass = m.jumlah.includes('CR') ? 'amount-cr' : 'amount-db';
        const statusClass = `status-${m.status || 'draft'}`;
        const statusText = m.status || 'draft';
        tr.innerHTML = `
            <td>${m.tanggal}</td>
            <td class="col-keterangan">${m.keterangan}</td>
            <td>${m.cabang}</td>
            <td class="${amountClass}">${m.jumlah}</td>
            <td>${m.saldo}</td>
            <td class="${statusClass}">${statusText}</td>
            <td class="col-aksi">
                <button class="action-btn confirm" onclick="updateMutasiStatus(${detailCurrentFileId}, ${actualIndex}, 'confirmed')">✓ Confirm</button>
                <button class="action-btn reject" onclick="updateMutasiStatus(${detailCurrentFileId}, ${actualIndex}, 'reject')">✗ Reject</button>
                <button class="action-btn edit" onclick="updateMutasiStatus(${detailCurrentFileId}, ${actualIndex}, 'edited')">✎ Edit</button>
            </td>
        `;
        mutasiDetailBody.appendChild(tr);
    });
}

// Render detail pagination pages
function renderDetailPaginationPages(totalPages) {
    detailPaginationPages.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, detailCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if end page is at the limit
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
        addPageButton(1, false);
        if (startPage > 2) {
            addEllipsis();
        }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, i === detailCurrentPage);
    }
    
    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addEllipsis();
        }
        addPageButton(totalPages, false);
    }
}

// Add page button to pagination
function addPageButton(pageNum, isActive) {
    const btn = document.createElement('button');
    btn.className = `detail-page-btn ${isActive ? 'active' : ''}`;
    btn.textContent = pageNum;
    btn.onclick = () => goToDetailPage(pageNum);
    detailPaginationPages.appendChild(btn);
}

// Add ellipsis to pagination
function addEllipsis() {
    const span = document.createElement('span');
    span.className = 'detail-page-btn disabled';
    span.textContent = '...';
    detailPaginationPages.appendChild(span);
}

// Go to specific page
function goToDetailPage(pageNum) {
    detailCurrentPage = pageNum;
    renderDetailTable();
}

// Change detail page (prev/next)
function changeDetailPage(direction) {
    if (direction === 'prev' && detailCurrentPage > 1) {
        detailCurrentPage--;
    } else if (direction === 'next') {
        const data = getBankData();
        const file = data.files.find(f => f.id == detailCurrentFileId);
        if (file) {
            const totalPages = Math.ceil(file.mutasi.length / detailItemsPerPageValue);
            if (detailCurrentPage < totalPages) {
                detailCurrentPage++;
            }
        }
    }
    renderDetailTable();
}





// Initial render
renderFileTable();
renderAllDataTable();
showTab('perfile');

// Add event listener to close modal when clicking outside
detailModalOverlay.addEventListener('click', (e) => {
    if (e.target === detailModalOverlay) {
        closeDetailModal();
    }
});

// Add event listener for items per page dropdown
detailItemsPerPage.addEventListener('change', (e) => {
    detailItemsPerPageValue = parseInt(e.target.value);
    detailCurrentPage = 1; // Reset to first page
    renderDetailTable();
});

// Custom Modal Functions

function showCustomModal(title, message, icon = '❓', type = 'confirm') {
    const modal = document.getElementById('customModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const modalActions = document.getElementById('modalActions');
    
    if (modal && modalTitle && modalMessage && modalIcon && modalActions) {
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
        
        modal.classList.add('show');
    }
}

function showCustomConfirm(title, message, icon = '❓') {
    return new Promise((resolve) => {
        modalCallback = resolve;
        showCustomModal(title, message, icon, 'confirm');
    });
}

function showCustomAlert(title, message, icon = 'ℹ️') {
    showCustomModal(title, message, icon, 'alert');
}

function closeCustomModal() {
    const modal = document.getElementById('customModalOverlay');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Resolve with false for cancel
    if (modalCallback) {
        modalCallback(false);
        modalCallback = null;
    }
}

function confirmCustomModal() {
    const modal = document.getElementById('customModalOverlay');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Resolve with true for confirm
    if (modalCallback) {
        modalCallback(true);
        modalCallback = null;
    }
}

// Snackbar Functions
function showSnackbar(message, type = 'info') {
    const snackbar = document.getElementById('snackbar');
    const snackbarMessage = document.getElementById('snackbarMessage');
    const snackbarIcon = document.getElementById('snackbarIcon');
    
    snackbarMessage.textContent = message;
    
    // Set icon based on type
    switch(type) {
        case 'error':
            snackbarIcon.textContent = '❌';
            break;
        case 'success':
            snackbarIcon.textContent = '✅';
            break;
        default:
            snackbarIcon.textContent = 'ℹ️';
    }
    
    snackbar.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

function closeSnackbar() {
    const snackbar = document.getElementById('snackbar');
    snackbar.classList.remove('show');
}

// Global functions for detail pagination
function changeDetailPage(direction) {
    if (direction === 'prev' && detailCurrentPage > 1) {
        detailCurrentPage--;
    } else if (direction === 'next') {
        const data = getBankData();
        const file = data.files.find(f => f.id == detailCurrentFileId);
        if (file) {
            const totalPages = Math.ceil(file.mutasi.length / detailItemsPerPageValue);
            if (detailCurrentPage < totalPages) {
                detailCurrentPage++;
            }
        }
    }
    renderDetailTable();
}

// Logout function
async function logout() {
    console.log('Bank logout method called');
    
    try {
        console.log('About to show custom confirmation dialog...');
        // Show custom confirmation dialog
        const confirmed = await showCustomConfirm(
            'Logout Confirmation',
            'Are you sure you want to logout?\n\nYou will be redirected to the login page.',
            '🚪'
        );
        
        console.log('Confirmation result received:', confirmed);
        console.log('Confirmation result type:', typeof confirmed);
        
        if (confirmed) {
            console.log('User confirmed logout, proceeding...');
            // Clear any stored session data
            clearSessionData();
            
            // Show logout message
            showSnackbar('Logging out...', 2000, '👋');
            
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
            clearSessionData();
            showSnackbar('Logging out...', 2000, '👋');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
}

// Clear session data
function clearSessionData() {
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

 