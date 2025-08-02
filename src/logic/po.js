// === PO MANAGEMENT POC ===
// Data structure in localStorage: { files: [ { id, name, uploadDate, supplier, poNumber, items: [ ... ] } ] }

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
    console.log('User authenticated, initializing PO page...');
}

function getPOData() {
    return JSON.parse(localStorage.getItem('poUploads') || '{"files":[]}');
}
function setPOData(data) {
    localStorage.setItem('poUploads', JSON.stringify(data));
}

// UI Elements
const uploadBtn = document.getElementById('uploadBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const fileInput = document.getElementById('poFileInput');
const uploadFileName = document.getElementById('uploadFileName');
const tabPerFile = document.getElementById('tabPerFile');
const tabAllData = document.getElementById('tabAllData');
const tabContentPerFile = document.getElementById('tabContentPerFile');
const tabContentAllData = document.getElementById('tabContentAllData');
const fileTableBody = document.getElementById('fileTableBody');
const allDataBody = document.getElementById('allDataBody');

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
tabPerFile.onclick = () => showTab('perfile');
tabAllData.onclick = () => showTab('alldata');

// Upload logic
uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file extension
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'edi'];
    
    if (!allowedExtensions.includes(fileExtension)) {
        showSnackbar('❌ Format file tidak didukung! Gunakan .csv, .xlsx, .xls, atau .edi', 'error');
        fileInput.value = '';
        return;
    }
    
    uploadFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const text = ev.target.result;
        let parsed = null;
        
        // Check file extension to determine parsing method
        if (fileExtension === 'edi') {
            parsed = parsePOEDI(text);
            if (!parsed) {
                showSnackbar('❌ Format EDI tidak valid! Pastikan file berisi POHDR dan LIN records.', 'error');
                return;
            }
        } else {
            parsed = parsePOCSV(text);
            if (!parsed) {
                showSnackbar('❌ Format CSV tidak valid! Pastikan file berisi kolom yang benar.', 'error');
                return;
            }
        }
        
        savePOFile(file.name, parsed);
        renderFileTable();
        renderAllDataTable();
        uploadFileName.textContent = '';
        fileInput.value = '';
        showSnackbar(`✅ Upload & parsing ${fileExtension.toUpperCase()} berhasil!`, 'success');
    };
    reader.readAsText(file);
};

// Clear data logic
clearDataBtn.onclick = async () => {
    try {
        const confirmed = await showCustomConfirm(
            '🗑️ Hapus Data',
            'Yakin ingin menghapus semua data upload?',
            '⚠️'
        );
        
        if (confirmed) {
            localStorage.removeItem('poUploads');
            renderFileTable();
            renderAllDataTable();
            showSnackbar('✅ Semua data berhasil dihapus!', 'success');
        }
    } catch (error) {
        console.error('Error with custom modal, using fallback:', error);
        // Fallback to browser confirm
        const confirmed = confirm('Yakin ingin menghapus semua data upload?');
        if (confirmed) {
            localStorage.removeItem('poUploads');
            renderFileTable();
            renderAllDataTable();
            showSnackbar('✅ Semua data berhasil dihapus!', 'success');
        }
    }
};

// CSV Parsing untuk PO
function parsePOCSV(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim());
    // Cari header info
    let supplier = '', poNumber = '';
    for (let i = 0; i < 10; i++) {
        if (lines[i]?.startsWith('Supplier')) supplier = lines[i].split(':')[1]?.trim() || '';
        if (lines[i]?.startsWith('PO Number')) poNumber = lines[i].split(':')[1]?.trim() || '';
    }
    // Cari index header items
    let headerIdx = lines.findIndex(l => l.startsWith('Item Code'));
    if (headerIdx === -1) return null;
    // Ambil kolom header
    const headers = lines[headerIdx].split(',').map(h => h.trim());
    // Ambil data items
    let items = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        if (!lines[i] || lines[i].startsWith('Total')) break;
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 6) continue;
        items.push({
            itemCode: cols[0],
            description: cols[1],
            quantity: cols[2],
            unitPrice: cols[3],
            total: cols[4],
            status: 'draft' // Tambahkan status default
        });
    }
    return { supplier, poNumber, items };
}

// EDI Parsing untuk PO
function parsePOEDI(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) return null;
    
    // Parse POHDR (Purchase Order Header)
    const pohdrLine = lines.find(line => line.startsWith('POHDR'));
    if (!pohdrLine) return null;
    
    const pohdrFields = pohdrLine.split('|');
    if (pohdrFields.length < 9) return null;
    
    // Extract header information based on the example format
    // POHDR|2PZ1POC25003023|20250311|20250318|20250311000000|2PZ1|TANGERANG|2PZ1.J.0400.1.F|PT EFG|JAKARTA BARAT|||08.30|4
    const poNumber = pohdrFields[1] || '';
    const poDate = pohdrFields[2] || '';
    const deliveryDate = pohdrFields[3] || '';
    const supplier = pohdrFields[8] || ''; // PT EFG
    const supplierAddress = pohdrFields[9] || ''; // JAKARTA BARAT
    
    // Parse LIN (Line Items)
    const items = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('LIN')) {
            const linFields = line.split('|');
            if (linFields.length >= 15) {
                // LIN|TAS BELANJA|4|0|4324992|12345678910|1000|BAG|250|0.00%||1000|0|1000000|0|0|0|1.00%
                items.push({
                    itemCode: linFields[4] || '', // 4324992
                    description: linFields[1] || '', // TAS BELANJA
                    quantity: linFields[2] || '', // 4
                    unitPrice: linFields[6] || '', // 1000
                    total: linFields[10] || '', // 1000
                    unit: linFields[7] || '', // BAG
                    discount: linFields[9] || '', // 0.00%
                    status: 'draft'
                });
            }
        }
    }
    
    // Parse TRL (Trailer/Summary) if available
    const trlLine = lines.find(line => line.startsWith('TRL'));
    let totalAmount = '';
    if (trlLine) {
        const trlFields = trlLine.split('|');
        if (trlFields.length >= 5) {
            // TRL|1000000|10000|0|108900|1098900|1098900|SATU JUTA SEMBILAN PULUH DELAPAN RIBU SEMBILAN PULUH DELAPAN RATUS|HPP|123456789|PT EFG|BCA|0
            totalAmount = trlFields[1] || ''; // 1000000
        }
    }
    
    return { 
        supplier, 
        poNumber, 
        poDate,
        deliveryDate,
        totalAmount,
        items 
    };
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
function savePOFile(filename, parsed) {
    const data = getPOData();
    const id = Date.now();
    data.files.push({
        id,
        name: filename,
        uploadDate: new Date().toLocaleString('id-ID'),
        supplier: parsed.supplier,
        poNumber: parsed.poNumber,
        poDate: parsed.poDate || '',
        deliveryDate: parsed.deliveryDate || '',
        totalAmount: parsed.totalAmount || '',
        items: parsed.items // Status sudah ada di parsing
    });
    setPOData(data);
}

// Render tabel file upload
function renderFileTable() {
    const data = getPOData();
    fileTableBody.innerHTML = '';
    data.files.forEach(file => {
        const tr = document.createElement('tr');
        const poDateInfo = file.poDate ? ` (${file.poDate})` : '';
        const deliveryInfo = file.deliveryDate ? ` (${file.deliveryDate})` : '';
        const totalInfo = file.totalAmount ? ` - Total: ${file.totalAmount}` : '';
        tr.innerHTML = `
            <td>${file.name}</td>
            <td>${file.uploadDate}</td>
            <td>${file.supplier}</td>
            <td>${file.poNumber}${poDateInfo}</td>
            <td>${file.items.length}${totalInfo}</td>
            <td class="status-draft">draft</td>
            <td><button class="detail-btn" data-id="${file.id}">📋 Detail</button></td>
        `;
        fileTableBody.appendChild(tr);
    });
}

// Render semua data PO (flat)
function renderAllDataTable() {
    const data = getPOData();
    allDataBody.innerHTML = '';
    data.files.forEach((file, fileIndex) => {
        file.items.forEach((item, itemIndex) => {
            const tr = document.createElement('tr');
            const statusClass = `status-${item.status || 'draft'}`;
            const statusText = item.status || 'draft';
            const unitInfo = item.unit ? ` (${item.unit})` : '';
            const discountInfo = item.discount ? ` ${item.discount}` : '';
            tr.innerHTML = `
                <td>${file.name}</td>
                <td>${file.poNumber}</td>
                <td>${file.supplier}</td>
                <td>${item.itemCode}</td>
                <td class="col-keterangan">${item.description}${unitInfo}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice}${discountInfo}</td>
                <td>${item.total}</td>
                <td class="${statusClass}">${statusText}</td>
                <td class="col-aksi">
                    <button class="action-btn confirm" onclick="updateItemStatus(${file.id}, ${itemIndex}, 'confirmed')">✓ Confirm</button>
                    <button class="action-btn reject" onclick="updateItemStatus(${file.id}, ${itemIndex}, 'reject')">✗ Reject</button>
                    <button class="action-btn edit" onclick="updateItemStatus(${file.id}, ${itemIndex}, 'edited')">✎ Edit</button>
                </td>
            `;
            allDataBody.appendChild(tr);
        });
    });
}

// Update status item
function updateItemStatus(fileId, itemIndex, newStatus) {
    const data = getPOData();
    const file = data.files.find(f => f.id == fileId);
    if (!file || !file.items[itemIndex]) return;
    
    file.items[itemIndex].status = newStatus;
    setPOData(data);
    
    // Refresh tables
    renderFileTable();
    renderAllDataTable();
    
    showSnackbar(`Status berhasil diubah menjadi: ${newStatus}`, 'success');
}

// Initial render
renderFileTable();
renderAllDataTable();
showTab('perfile');

// Add event listener for detail buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('detail-btn')) {
        const fileId = e.target.getAttribute('data-id');
        showFileDetail(fileId);
    }
});

// Function to show file detail
function showFileDetail(fileId) {
    const data = getPOData();
    const file = data.files.find(f => f.id == fileId);
    if (!file) return;
    
    // Create structured HTML for file detail
    const detailHTML = `
        <div class="file-detail-container">
            <div class="file-detail-header">
                <div class="file-icon">📋</div>
                <div class="file-info">
                    <h3 class="file-name">${file.name}</h3>
                    <p class="file-upload-date">📅 Upload Date: ${file.uploadDate}</p>
                </div>
            </div>
            
            <div class="file-detail-sections">
                <div class="detail-section">
                    <h4 class="section-title">📄 Purchase Order Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">🏢 Supplier:</span>
                            <span class="detail-value">${file.supplier}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📄 PO Number:</span>
                            <span class="detail-value">${file.poNumber}</span>
                        </div>
                        ${file.poDate ? `
                        <div class="detail-item">
                            <span class="detail-label">📅 PO Date:</span>
                            <span class="detail-value">${file.poDate}</span>
                        </div>
                        ` : ''}
                        ${file.deliveryDate ? `
                        <div class="detail-item">
                            <span class="detail-label">🚚 Delivery Date:</span>
                            <span class="detail-value">${file.deliveryDate}</span>
                        </div>
                        ` : ''}
                        ${file.totalAmount ? `
                        <div class="detail-item">
                            <span class="detail-label">💰 Total Amount:</span>
                            <span class="detail-value">${file.totalAmount}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="section-title">📦 Items (${file.items.length})</h4>
                    <div class="items-container">
                        ${file.items.map((item, index) => `
                            <div class="item-card">
                                <div class="item-header">
                                    <span class="item-number">${index + 1}</span>
                                    <span class="item-code">${item.itemCode}</span>
                                </div>
                                <div class="item-description">${item.description}</div>
                                <div class="item-details">
                                    <div class="item-detail-row">
                                        <span class="detail-label">Qty:</span>
                                        <span class="detail-value">${item.quantity} ${item.unit || ''}</span>
                                    </div>
                                    <div class="item-detail-row">
                                        <span class="detail-label">Price:</span>
                                        <span class="detail-value">${item.unitPrice}${item.discount ? ` (${item.discount})` : ''}</span>
                                    </div>
                                    <div class="item-detail-row">
                                        <span class="detail-label">Total:</span>
                                        <span class="detail-value">${item.total}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showCustomAlert('File Detail', detailHTML, '📋', 'html');
}

// Custom Modal Functions
let modalCallback = null;

function showCustomModal(title, message, icon = '❓', type = 'confirm', contentType = 'text') {
    const modal = document.getElementById('customModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const modalActions = document.getElementById('modalActions');
    
    if (modal && modalTitle && modalMessage && modalIcon && modalActions) {
        modalTitle.textContent = title;
        
        // Handle different content types
        if (contentType === 'html') {
            modalMessage.innerHTML = message;
        } else {
            modalMessage.textContent = message;
        }
        
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

function showCustomAlert(title, message, icon = 'ℹ️', type = 'text') {
    showCustomModal(title, message, icon, 'alert', type);
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

// Logout function
async function logout() {
    console.log('PO logout method called');
    
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