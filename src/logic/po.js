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

// Upload logic with OCR support
uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file extension
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'edi', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    
    if (!allowedExtensions.includes(fileExtension)) {
        showSnackbar('❌ Format file tidak didukung! Gunakan .csv, .xlsx, .xls, .edi, .pdf, atau gambar (.jpg, .png, dll)', 'error');
        fileInput.value = '';
        return;
    }
    
    uploadFileName.textContent = file.name;
    
    try {
        let parsed = null;
        
        // Check if it's an OCR-supported file type
        if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
            // Show processing message
            showSnackbar('🔄 Memproses OCR... Mohon tunggu', 'info');
            
            // Process with OCR
            parsed = await processFileWithOCR(file);
        } else {
            // Process with existing methods
            const reader = new FileReader();
            parsed = await new Promise((resolve, reject) => {
                reader.onload = function(ev) {
                    const text = ev.target.result;
                    let result = null;
                    
                    // Check file extension to determine parsing method
                    if (fileExtension === 'edi') {
                        result = parsePOEDI(text);
                        if (!result) {
                            reject(new Error('Format EDI tidak valid! Pastikan file berisi POHDR dan LIN records.'));
                            return;
                        }
                    } else {
                        result = parsePOCSV(text);
                        if (!result) {
                            reject(new Error('Format CSV tidak valid! Pastikan file berisi kolom yang benar.'));
                            return;
                        }
                    }
                    resolve(result);
                };
                reader.onerror = () => reject(new Error('Gagal membaca file'));
                reader.readAsText(file);
            });
        }
        
        if (parsed) {
            savePOFile(file.name, parsed);
            renderFileTable();
            renderAllDataTable();
            uploadFileName.textContent = '';
            fileInput.value = '';
            showSnackbar(`Upload & parsing ${fileExtension.toUpperCase()} berhasil!`, 'success');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showSnackbar(`❌ Error: ${error.message}`, 'error');
        uploadFileName.textContent = '';
        fileInput.value = '';
    }
};

// Format currency function
function formatCurrency(amount) {
    if (!amount || amount === '' || amount === null || amount === undefined) {
        return 'Rp 0';
    }
    
    // Convert to number if it's a string
    let numAmount = amount;
    if (typeof amount === 'string') {
        // Remove any non-numeric characters except decimal point
        numAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
        if (isNaN(numAmount)) {
            return 'Rp 0';
        }
    }
    
    // Format as Indonesian Rupiah
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numAmount);
}

// Save to localStorage
function saveToLocalStorage(data) {
    try {
        // Get existing data
        const existingData = JSON.parse(localStorage.getItem('poData') || '[]');
        
        // Add new data with timestamp
        const newEntry = {
            ...data,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };
        
        existingData.push(newEntry);
        
        // Save back to localStorage
        localStorage.setItem('poData', JSON.stringify(existingData));
        
        console.log('Data saved to localStorage:', newEntry);
        
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showMessage('Error menyimpan data ke localStorage', 'error');
    }
}

// Show message function
function showMessage(message, type = 'info') {
    const snackbar = document.getElementById('snackbar');
    const snackbarIcon = document.getElementById('snackbarIcon');
    const snackbarMessage = document.getElementById('snackbarMessage');
    
    if (!snackbar || !snackbarIcon || !snackbarMessage) {
        // Fallback: create simple alert
        alert(message);
        return;
    }
    
    // Set icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    snackbarIcon.textContent = icons[type] || icons.info;
    snackbarMessage.textContent = message;
    
    // Show snackbar
    snackbar.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

// Process file with OCR
async function processFileWithOCR(file) {
    try {
        console.log('Processing file with OCR...');
        
        // Convert file to buffer for IPC
        const arrayBuffer = await file.arrayBuffer();
        const fileData = {
            name: file.name,
            data: Array.from(new Uint8Array(arrayBuffer))
        };
        
        // Send file data to main process for OCR processing
        const result = await window.electronAPI.uploadAndOCR(fileData);
        
        if (result.success) {
            console.log('OCR processing successful:', result.data);
            
            // Convert the new structured data to table format
            const tableData = convertOCRDataToTable(result.data);
            
            // Save to the existing PO system
            savePOFile(file.name, tableData);
            
            // Refresh tables
            renderFileTable();
            renderAllDataTable();
            
            // Show success message
            showMessage('File berhasil diproses dengan OCR!', 'success');
            
        } else {
            console.error('OCR processing failed:', result.error);
            showMessage(`OCR processing gagal: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('Error processing file with OCR:', error);
        showMessage(`Error: ${error.message}`, 'error');
    }
}

// Convert OCR data to table format
function convertOCRDataToTable(ocrData) {
    const tableData = {
        name: 'OCR File',
        supplier: ocrData.supplier?.name || '',
        poNumber: ocrData.supplier?.poNumber || ocrData.order?.fppNumber || '',
        poDate: ocrData.order?.orderDate || '',
        deliveryDate: ocrData.order?.deliveryDate || '',
        totalAmount: ocrData.financial?.totalPurchasePrice || ocrData.financial?.totalInvoice || '',
        items: []
    };
    
    // Convert items array
    if (ocrData.items && Array.isArray(ocrData.items)) {
        tableData.items = ocrData.items.map(item => ({
            itemCode: item.productCode || item.productName || '',
            description: item.productName || '',
            quantity: item.qCrt || item.minRecQPcs || '',
            unitPrice: item.pluPrice || '',
            total: item.total || '',
            unit: 'pcs',
            discount: item.contCPotA || '',
            status: 'draft'
        }));
    }
    
    // Add additional data to localStorage for detailed view
    const detailedData = {
        ...tableData,
        supplierDetails: ocrData.supplier || {},
        deliveryDetails: ocrData.delivery || {},
        orderDetails: ocrData.order || {},
        financialDetails: ocrData.financial || {},
        notes: ocrData.notes || {}
    };
    
    // Store detailed data
    localStorage.setItem('poDetailedData', JSON.stringify(detailedData));
    
    return tableData;
}

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
            showSnackbar('Semua data berhasil dihapus!', 'success');
        }
    } catch (error) {
        console.error('Error with custom modal, using fallback:', error);
        // Fallback to browser confirm
        const confirmed = confirm('Yakin ingin menghapus semua data upload?');
        if (confirmed) {
            localStorage.removeItem('poUploads');
            renderFileTable();
            renderAllDataTable();
            showSnackbar('Semua data berhasil dihapus!', 'success');
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
    const supplierAddress = pohdrFields[9] || ''; 
    
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
    
    // Check if this is an OCR file with detailed data
    const detailedData = localStorage.getItem('poDetailedData');
    let hasDetailedData = false;
    let ocrData = null;
    
    if (detailedData) {
        try {
            ocrData = JSON.parse(detailedData);
            hasDetailedData = true;
        } catch (e) {
            console.log('No detailed OCR data found');
        }
    }
    
    // Check if file is EDI format (don't show OCR text for EDI files)
    const isEDIFile = file.name.toLowerCase().endsWith('.edi');
    
    // Create structured HTML for file detail
    const detailHTML = `
        <div class="file-detail-container">
            <div class="file-detail-header">
                <div class="file-info">
                    <h3 class="file-name">${file.name}</h3>
                    <p class="file-upload-date">📅 Upload Date: ${file.uploadDate}</p>
                    ${hasDetailedData && !isEDIFile ? '<p style="color: #4ade80;">🤖 Processed with OCR</p>' : ''}
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
                
                ${hasDetailedData ? `
                <div class="detail-section">
                    <h4 class="section-title">OCR Detailed Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">📋 FPP Number:</span>
                            <span class="detail-value">${ocrData.orderDetails?.fppNumber || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">⏰ Hour Schedule:</span>
                            <span class="detail-value">${ocrData.orderDetails?.hourSchedule || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🚪 Door:</span>
                            <span class="detail-value">${ocrData.orderDetails?.door || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💰 Total Purchase Price:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalPurchasePrice || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📝 Notes:</span>
                            <span class="detail-value">${ocrData.notes?.generalNotes || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🏢 Supplier Address:</span>
                            <span class="detail-value">${ocrData.supplierDetails?.address || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📞 Supplier Phone:</span>
                            <span class="detail-value">${ocrData.supplierDetails?.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📠 Supplier Fax:</span>
                            <span class="detail-value">${ocrData.supplierDetails?.fax || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🚚 Delivery To:</span>
                            <span class="detail-value">${ocrData.deliveryDetails?.deliverTo || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🚛 Vehicle Number:</span>
                            <span class="detail-value">${ocrData.deliveryDetails?.vehicleNumber || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📦 Palet:</span>
                            <span class="detail-value">${ocrData.deliveryDetails?.palet || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💳 Invoice Discount:</span>
                            <span class="detail-value">${ocrData.financialDetails?.invoiceDisc || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💵 Total Item Discount:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalItemDiscount || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💸 Total Invoice Discount:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalInvoiceDiscount || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💰 Total After Discount:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalAfterDiscount || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🎁 Total Bonus:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalBonus || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📊 Total LST:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalLST || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🧾 Total VAT Input:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalVATInput || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💳 Total Include VAT:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalIncludeVAT || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📄 Total Invoice:</span>
                            <span class="detail-value">${ocrData.financialDetails?.totalInvoice || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📝 Amount in Words:</span>
                            <span class="detail-value">${ocrData.notes?.byLetter || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    showCustomAlert('File Detail', detailHTML, '📋', 'html');
}

// Add to table with detail button
function addToTable(data) {
    const tbody = document.querySelector('#fileTableBody');
    
    if (!tbody) {
        console.error('Table body not found');
        showMessage('Error: Table tidak ditemukan', 'error');
        return;
    }
    
    const row = document.createElement('tr');
    
    // Format sesuai dengan struktur tabel yang ada
    row.innerHTML = `
        <td>${data.filename || 'OCR File'}</td>
        <td>${new Date().toLocaleDateString()}</td>
        <td>${data.supplier || ''}</td>
        <td>${data.poNumber || ''}</td>
        <td>${data.items ? data.items.length : 0} item(s)</td>
        <td class="status-draft">draft</td>
        <td><button class="detail-btn" data-id="${Date.now()}">📋 Detail</button></td>
    `;
    
    tbody.appendChild(row);
    
    // Refresh all data table
    renderAllDataTable();
}

// View detail function
function viewDetail(poNumber) {
    // Navigate to detail page
    window.location.href = 'po-detail.html';
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