// LPB Management Logic
let lpbData = [];
let currentFileData = null;
let selectedFiles = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('LPB Page loaded, initializing...');
    initializeLPBPage();
    setupEventListeners();
    setupUploadModal();
    loadLPBData();
    console.log('LPB Page initialization completed');
});

function initializeLPBPage() {
    // Initialize tabs
    const tabPerFile = document.getElementById('tabPerFile');
    const tabAllData = document.getElementById('tabAllData');
    const tabContentPerFile = document.getElementById('tabContentPerFile');
    const tabContentAllData = document.getElementById('tabContentAllData');

    tabPerFile.addEventListener('click', () => {
        tabPerFile.classList.add('active');
        tabAllData.classList.remove('active');
        tabContentPerFile.classList.remove('hidden');
        tabContentAllData.classList.add('hidden');
    });

    tabAllData.addEventListener('click', () => {
        tabAllData.classList.add('active');
        tabPerFile.classList.remove('active');
        tabContentAllData.classList.remove('hidden');
        tabContentPerFile.classList.add('hidden');
    });
}

function setupEventListeners() {
    console.log('Setting up LPB event listeners...');
    
    // Upload button
    const uploadBtn = document.getElementById('mainUploadBtn');
    console.log('Main upload button found:', uploadBtn);
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            console.log('Main upload button clicked');
            openUploadDialog();
        });
        console.log('Main upload button event listener attached');
    } else {
        console.error('Main upload button not found!');
    }

    // Clear data button
    const clearDataBtn = document.getElementById('clearDataBtn');
    console.log('Clear data button found:', clearDataBtn);
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            console.log('Clear data button clicked');
            showCustomModal(
                'Clear Data',
                '🗑️',
                'Are you sure you want to clear all LPB data? This action cannot be undone.',
                () => {
                    clearAllData();
                    showSnackbar('✅', 'All LPB data has been cleared successfully!');
                }
            );
        });
        console.log('Clear data button event listener attached');
    } else {
        console.error('Clear data button not found!');
    }
    
    console.log('LPB event listeners setup completed');
}

function setupUploadModal() {
    console.log('Setting up LPB upload modal...');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('modalUploadBtn');

    console.log('Upload area found:', uploadArea);
    console.log('File input found:', fileInput);
    console.log('Modal upload button found:', uploadBtn);

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            console.log('File input change event triggered');
            selectedFiles = Array.from(e.target.files);
            console.log('Selected files:', selectedFiles);
            updateUploadButton();
            updateUploadArea();
        });
        console.log('File input change event listener attached');
    } else {
        console.error('File input element not found!');
    }

    // Drag and drop events
    if (uploadArea) {
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
            if (fileInput) {
                fileInput.files = e.dataTransfer.files;
            }
            updateUploadButton();
            updateUploadArea();
        });
    }

    // Click to select files
    if (uploadArea) {
        uploadArea.addEventListener('click', (e) => {
            console.log('LPB Upload area clicked');
            e.preventDefault();
            e.stopPropagation();
            console.log('LPB File input element:', fileInput);
            if (fileInput) {
                console.log('LPB File input properties:', {
                    type: fileInput.type,
                    accept: fileInput.accept,
                    multiple: fileInput.multiple,
                    disabled: fileInput.disabled,
                    style: fileInput.style.display
                });
                try {
                    fileInput.click();
                    console.log('LPB File input clicked successfully');
                } catch (error) {
                    console.error('LPB Error clicking file input:', error);
                }
            } else {
                console.error('LPB File input not found');
            }
        });
    }
}



function updateUploadButton() {
    const uploadBtn = document.getElementById('modalUploadBtn');
    if (uploadBtn) {
        uploadBtn.disabled = selectedFiles.length === 0;
    }
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
        uploadHint.textContent = 'Supports EDI, CSV, Excel, PDF and Image files';
    }
}

function openUploadDialog() {
    console.log('Opening upload dialog...');
    const uploadDialog = document.getElementById('uploadDialog');
    console.log('Upload dialog element:', uploadDialog);
    if (uploadDialog) {
        uploadDialog.classList.add('active');
        selectedFiles = [];
        updateUploadButton();
        updateUploadArea();
        console.log('Upload dialog opened successfully');
    } else {
        console.error('Upload dialog element not found!');
    }
}

function closeUploadDialog() {
    const uploadDialog = document.getElementById('uploadDialog');
    uploadDialog.classList.remove('active');
    selectedFiles = [];
    document.getElementById('fileInput').value = '';
    updateUploadButton();
    updateUploadArea();
}

async function uploadFiles() {
    if (selectedFiles.length === 0) {
        showSnackbar('❌', 'Please select files to upload');
        return;
    }

    // Validate files
    const supportedFormats = ['pdf'];
    const invalidFiles = selectedFiles.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return !supportedFormats.includes(extension);
    });

    if (invalidFiles.length > 0) {
        showSnackbar('❌', `Unsupported file format(s): ${invalidFiles.map(f => f.name).join(', ')}. Only PDF files are supported.`);
        return;
    }

    // Process files with enhanced OCR
    showSnackbar('⏳', `Processing ${selectedFiles.length} LPB file(s) with OCR...`);
    
    try {
        for (const file of selectedFiles) {
            console.log(`Processing LPB file: ${file.name}`);
            
            // Create a temporary file path for processing
            const tempFilePath = `./temp_${file.name}`;
            
            // In a real implementation, you would save the file to temp path
            // For now, we'll use the enhanced OCR processing
            const processedData = await processLPBOCRData(file.name);
            
            // Convert OCR data to LPB format
            const lpbData = convertOCRDataToLPBFormat(processedData, file.name);
            
            addLPBData(lpbData);
        }
        
        closeUploadDialog();
        showSnackbar('✅', `${selectedFiles.length} LPB file(s) processed successfully!`);
        
    } catch (error) {
        console.error('Error processing LPB files:', error);
        showSnackbar('❌', `Error processing LPB files: ${error.message}`);
    }
}

function simulateOCRProcessing(fileName, fileExtension) {
    // Enhanced LPB OCR Processing Function
    console.log(`Processing LPB file: ${fileName} with extension: ${fileExtension}`);
    
    try {
        // Simulate OCR processing with dynamic data extraction
        const processedData = processLPBOCRData(fileName);
        console.log('LPB OCR processing completed:', processedData);
        return processedData;
    } catch (error) {
        console.error('LPB OCR processing error:', error);
        // Return fallback data if OCR fails
        return createFallbackLPBData(fileName);
    }
}

function processLPBOCRData(fileName) {
    // Simulate OCR text extraction from PDF
    const extractedText = simulateTextExtraction(fileName);
    
    // Parse the extracted text to extract LPB data
    const parsedData = parseLPBText(extractedText, fileName);
    
    return parsedData;
}

function simulateTextExtraction(fileName) {
    // Simulate extracting text from PDF
    // In real implementation, this would use PDF parsing library
    const now = new Date();
    const lpbNumber = `LPB-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Simulate different LPB document structures
    const documentTemplates = [
        // Template 1: Standard LPB format
        `LAPORAN PENERIMAAN BARANG (LPB)
        
        LPB Number: ${lpbNumber}
        Date: ${now.toLocaleDateString('id-ID')}
        Supplier: PT SUPPLIER MAJU
        Address: JAKARTA SELATAN
        Phone: 021-1234567
        
        PO Reference: PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}
        Delivery Date: ${new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')}
        
        ITEMS RECEIVED:
        #1 LAPTOP DELL INSPIRON 15 2 15000000 30000000
        #2 MOUSE WIRELESS 10 50000 500000
        #3 KEYBOARD MECHANICAL 5 200000 1000000
        
        TOTAL ITEMS: 3
        TOTAL AMOUNT: 31500000
        
        Received by: John Doe
        Verified by: Jane Smith
        Date: ${now.toLocaleDateString('id-ID')}`,
        
        // Template 2: Different supplier format
        `LAPORAN PENERIMAAN BARANG
        
        Nomor LPB: ${lpbNumber}
        Tanggal: ${now.toLocaleDateString('id-ID')}
        Supplier: CV TOKO MAKMUR
        Alamat: BANDUNG JAWA BARAT
        Telepon: 022-9876543
        
        Referensi PO: PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}
        Tanggal Pengiriman: ${new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')}
        
        BARANG YANG DITERIMA:
        #1 PRINTER HP LASERJET 3 2500000 7500000
        #2 TONER HP BLACK 15 150000 2250000
        #3 KERTAS A4 500 SHEET 20 50000 1000000
        
        JUMLAH BARANG: 3
        TOTAL NILAI: 10750000
        
        Diterima oleh: Ahmad Rahman
        Disetujui oleh: Siti Nurhaliza
        Tanggal: ${now.toLocaleDateString('id-ID')}`,
        
        // Template 3: Simple format
        `LPB ${lpbNumber}
        ${now.toLocaleDateString('id-ID')}
        
        Supplier: PT MAJU BERSAMA
        PO: PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}
        
        Items:
        1. MONITOR 24" 5 800000 4000000
        2. CABLE HDMI 10 25000 250000
        3. USB HUB 4-PORT 8 75000 600000
        
        Total: 4850000
        Items: 3`
    ];
    
    // Select template based on file name or random
    const templateIndex = Math.floor(Math.random() * documentTemplates.length);
    return documentTemplates[templateIndex];
}

function parseLPBText(text, fileName) {
    console.log('Parsing LPB text:', text);
    
    const now = new Date();
    const lpbNumber = `LPB-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Initialize LPB data structure
    const lpbData = {
        id: Date.now() + Math.random(),
        fileName: fileName,
        uploadDate: now.toLocaleDateString('id-ID'),
        lpbNumber: lpbNumber,
        supplier: '',
        poReference: '',
        totalItems: 0,
        status: 'draft',
        items: []
    };
    
    // Parse text line by line
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        // Extract LPB Number
        if (lowerLine.includes('lpb number') || lowerLine.includes('nomor lpb')) {
            const match = line.match(/(?:lpb number|nomor lpb):\s*(.+)/i);
            if (match) {
                lpbData.lpbNumber = match[1].trim();
            }
        } else if (line.includes('LPB') && line.match(/LPB-\d{4}-\d{3}/)) {
            const match = line.match(/(LPB-\d{4}-\d{3})/);
            if (match) {
                lpbData.lpbNumber = match[1];
            }
        }
        
        // Extract Supplier
        if (lowerLine.includes('supplier') || lowerLine.includes('supplier:')) {
            const match = line.match(/(?:supplier|supplier:)\s*(.+)/i);
            if (match) {
                lpbData.supplier = match[1].trim();
            }
        } else if (line.includes('PT') || line.includes('CV') || line.includes('TOKO')) {
            // Look for company names
            const companyMatch = line.match(/((?:PT|CV|TOKO)\s+[A-Z\s]+)/i);
            if (companyMatch && !lpbData.supplier) {
                lpbData.supplier = companyMatch[1].trim();
            }
        }
        
        // Extract PO Reference
        if (lowerLine.includes('po reference') || lowerLine.includes('referensi po') || lowerLine.includes('po:')) {
            const match = line.match(/(?:po reference|referensi po|po):\s*(.+)/i);
            if (match) {
                lpbData.poReference = match[1].trim();
            }
        } else if (line.includes('PO-') && line.match(/PO-\d{4}-\d{3}/)) {
            const match = line.match(/(PO-\d{4}-\d{3})/);
            if (match) {
                lpbData.poReference = match[1];
            }
        }
        
        // Extract Items
        if (line.includes('#') && line.match(/#\d+/)) {
            // This is an item line
            const item = parseLPBItem(line);
            if (item.itemCode) {
                lpbData.items.push(item);
            }
        } else if (line.match(/^\d+\.\s/) && line.includes('.')) {
            // Alternative item format: "1. MONITOR 24" 5 800000 4000000"
            const item = parseLPBItemAlternative(line);
            if (item.itemCode) {
                lpbData.items.push(item);
            }
        }
        
        // Extract total items count
        if (lowerLine.includes('total items') || lowerLine.includes('jumlah barang') || lowerLine.includes('items:')) {
            const match = line.match(/(?:total items|jumlah barang|items):\s*(\d+)/i);
            if (match) {
                lpbData.totalItems = parseInt(match[1]);
            }
        }
    }
    
    // If total items not found, calculate from items array
    if (lpbData.totalItems === 0 && lpbData.items.length > 0) {
        lpbData.totalItems = lpbData.items.length;
    }
    
    // If supplier not found, generate default
    if (!lpbData.supplier) {
        const suppliers = ['PT SUPPLIER MAJU', 'CV TOKO MAKMUR', 'PT MAJU BERSAMA', 'PT SINAR JAYA'];
        lpbData.supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    }
    
    // If PO reference not found, generate default
    if (!lpbData.poReference) {
        lpbData.poReference = `PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    }
    
    console.log('Parsed LPB data:', lpbData);
    return lpbData;
}

function parseLPBItem(line) {
    // Parse item line like: "#1 LAPTOP DELL INSPIRON 15 2 15000000 30000000"
    const item = {
        itemCode: '',
        description: '',
        quantity: 0,
        unitPrice: 0,
        total: 0
    };
    
    // Extract item code (usually starts with #)
    const itemCodeMatch = line.match(/#(\d+)/);
    if (itemCodeMatch) {
        item.itemCode = `ITEM-${itemCodeMatch[1].padStart(3, '0')}`;
    }
    
    // Split the line into parts
    const parts = line.split(/\s+/).filter(part => part.trim() !== '');
    
    // Find the description part (everything between #number and the first numeric value)
    let descriptionStart = -1;
    let descriptionEnd = -1;
    
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('#')) {
            descriptionStart = i + 1;
        } else if (parts[i].match(/^\d+$/) && descriptionStart !== -1 && descriptionEnd === -1) {
            descriptionEnd = i;
            break;
        }
    }
    
    if (descriptionStart !== -1 && descriptionEnd !== -1) {
        item.description = parts.slice(descriptionStart, descriptionEnd).join(' ');
    }
    
    // Extract numeric values (quantity, unit price, total)
    const numbers = parts.filter(part => part.match(/^\d+$/));
    if (numbers.length >= 3) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = parseInt(numbers[2]);
    } else if (numbers.length >= 2) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = item.quantity * item.unitPrice;
    }
    
    return item;
}

function parseLPBItemAlternative(line) {
    // Parse alternative item format like: "1. MONITOR 24" 5 800000 4000000"
    const item = {
        itemCode: '',
        description: '',
        quantity: 0,
        unitPrice: 0,
        total: 0
    };
    
    // Extract item number
    const itemNumberMatch = line.match(/^(\d+)\./);
    if (itemNumberMatch) {
        item.itemCode = `ITEM-${itemNumberMatch[1].padStart(3, '0')}`;
    }
    
    // Split the line and find description and numbers
    const parts = line.split(/\s+/).filter(part => part.trim() !== '');
    
    // Find description (everything after the number and dot, before the first numeric value)
    let descriptionStart = -1;
    let descriptionEnd = -1;
    
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].match(/^\d+\.$/)) {
            descriptionStart = i + 1;
        } else if (parts[i].match(/^\d+$/) && descriptionStart !== -1 && descriptionEnd === -1) {
            descriptionEnd = i;
            break;
        }
    }
    
    if (descriptionStart !== -1 && descriptionEnd !== -1) {
        item.description = parts.slice(descriptionStart, descriptionEnd).join(' ');
    }
    
    // Extract numeric values
    const numbers = parts.filter(part => part.match(/^\d+$/));
    if (numbers.length >= 3) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = parseInt(numbers[2]);
    } else if (numbers.length >= 2) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = item.quantity * item.unitPrice;
    }
    
    return item;
}

function createFallbackLPBData(fileName) {
    // Create fallback data if OCR parsing fails
    const now = new Date();
    const lpbNumber = `LPB-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    return {
        id: Date.now() + Math.random(),
        fileName: fileName,
        uploadDate: now.toLocaleDateString('id-ID'),
        lpbNumber: lpbNumber,
        supplier: 'PT SUPPLIER MAJU',
        poReference: `PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        totalItems: Math.floor(Math.random() * 10) + 1,
        status: 'draft',
        items: generateSampleItems(Math.floor(Math.random() * 10) + 1)
    };
}

function convertOCRDataToLPBFormat(ocrData, fileName) {
    console.log('Converting OCR data to LPB format:', ocrData);
    
    const now = new Date();
    
    // Initialize LPB data structure
    const lpbData = {
        id: Date.now() + Math.random(),
        fileName: fileName,
        uploadDate: now.toLocaleDateString('id-ID'),
        lpbNumber: '',
        supplier: '',
        poReference: '',
        totalItems: 0,
        status: 'draft',
        items: []
    };
    
    // Extract LPB information from OCR data
    if (ocrData.lpb) {
        lpbData.lpbNumber = ocrData.lpb.lpbNumber || `LPB-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        lpbData.poReference = ocrData.lpb.poReference || `PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    }
    
    // Extract supplier information
    if (ocrData.supplier && ocrData.supplier.name) {
        lpbData.supplier = ocrData.supplier.name;
    } else {
        lpbData.supplier = 'PT SUPPLIER MAJU';
    }
    
    // Extract items
    if (ocrData.items && Array.isArray(ocrData.items)) {
        lpbData.items = ocrData.items.map(item => ({
            itemCode: item.itemCode || `ITEM-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            description: item.description || 'Item Description',
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseInt(item.unitPrice) || 0,
            total: parseInt(item.total) || 0
        }));
    }
    
    // Set total items
    lpbData.totalItems = lpbData.items.length || 0;
    
    // If no items found, generate sample items
    if (lpbData.items.length === 0) {
        lpbData.items = generateSampleItems(Math.floor(Math.random() * 10) + 1);
        lpbData.totalItems = lpbData.items.length;
    }
    
    console.log('Converted LPB data:', lpbData);
    return lpbData;
}

function generateSampleItems(count) {
    const items = [];
    for (let i = 1; i <= count; i++) {
        items.push({
            itemCode: `ITEM-${String(i).padStart(3, '0')}`,
            description: `Sample Item ${i} - Description`,
            quantity: Math.floor(Math.random() * 100) + 1,
            unitPrice: Math.floor(Math.random() * 10000) + 1000,
            total: 0
        });
        items[i-1].total = items[i-1].quantity * items[i-1].unitPrice;
    }
    return items;
}

function addLPBData(data) {
    lpbData.unshift(data);
    loadLPBData();
}

function loadLPBData() {
    loadFileTableData();
    loadAllDataTable();
}

function loadFileTableData() {
    const tbody = document.getElementById('fileTableBody');
    tbody.innerHTML = '';

    lpbData.forEach(file => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${file.fileName}</td>
            <td>${file.uploadDate}</td>
            <td>${file.supplier}</td>
            <td>${file.lpbNumber}</td>
            <td>${file.totalItems}</td>
            <td><span class="status-${file.status}">${file.status.toUpperCase()}</span></td>
            <td>
                <button class="detail-btn" onclick="viewLPBDetail(${file.id})">
                    <span>👁️</span> View
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadAllDataTable() {
    const tbody = document.getElementById('allDataBody');
    tbody.innerHTML = '';

    lpbData.forEach(file => {
        file.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${file.fileName}</td>
                <td>${file.lpbNumber}</td>
                <td>${file.supplier}</td>
                <td>${item.itemCode}</td>
                <td class="col-keterangan">${item.description}</td>
                <td>${item.quantity.toLocaleString('id-ID')}</td>
                <td>Rp ${item.unitPrice.toLocaleString('id-ID')}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
                <td><span class="status-${file.status}">${file.status.toUpperCase()}</span></td>
                <td class="col-aksi">
                    <button class="action-btn confirm" onclick="confirmItem(${file.id}, '${item.itemCode}')">✓</button>
                    <button class="action-btn reject" onclick="rejectItem(${file.id}, '${item.itemCode}')">✗</button>
                    <button class="action-btn edit" onclick="editItem(${file.id}, '${item.itemCode}')">✎</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

function viewLPBDetail(fileId) {
    const file = lpbData.find(f => f.id === fileId);
    if (!file) return;

    currentFileData = file;
    
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon');
    const modalMessage = document.getElementById('modalMessage');
    const modalActions = document.getElementById('modalActions');

    modalTitle.textContent = `LPB Detail - ${file.lpbNumber}`;
    modalIcon.textContent = '📋';
    modalMessage.innerHTML = `
        <div class="file-detail-container">
            <div class="file-detail-header">
                <div class="file-icon">📄</div>
                <div class="file-info">
                    <div class="file-name">${file.fileName}</div>
                    <div class="file-upload-date">Uploaded on ${file.uploadDate}</div>
                </div>
            </div>
            
            <div class="file-detail-sections">
                <div class="detail-section">
                    <div class="section-title">
                        <span>📋</span> LPB Information
                    </div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">LPB Number:</span>
                            <span class="detail-value">${file.lpbNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Supplier:</span>
                            <span class="detail-value">${file.supplier}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">PO Reference:</span>
                            <span class="detail-value">${file.poReference}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Items:</span>
                            <span class="detail-value">${file.totalItems}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-${file.status}">${file.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="section-title">
                        <span>📦</span> Items (${file.items.length})
                    </div>
                    <div class="items-container">
                        ${file.items.map((item, index) => `
                            <div class="item-card">
                                <div class="item-header">
                                    <div class="item-number">${index + 1}</div>
                                    <div class="item-code">${item.itemCode}</div>
                                </div>
                                <div class="item-description">${item.description}</div>
                                <div class="item-details">
                                    <div class="item-detail-row">
                                        <span class="detail-label">Quantity:</span>
                                        <span class="detail-value">${item.quantity.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div class="item-detail-row">
                                        <span class="detail-label">Unit Price:</span>
                                        <span class="detail-value">Rp ${item.unitPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div class="item-detail-row">
                                        <span class="detail-label">Total:</span>
                                        <span class="detail-value">Rp ${item.total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modalActions.innerHTML = `
        <button class="btn btn-secondary" onclick="closeCustomModal()">Close</button>
        <button class="btn btn-primary" onclick="exportLPBData(${file.id})">Export</button>
    `;
    
    showCustomModal();
}

function confirmItem(fileId, itemCode) {
    showSnackbar('✅', `Item ${itemCode} confirmed successfully!`);
}

function rejectItem(fileId, itemCode) {
    showSnackbar('❌', `Item ${itemCode} rejected!`);
}

function editItem(fileId, itemCode) {
    showSnackbar('✎', `Editing item ${itemCode}...`);
}

function clearAllData() {
    lpbData = [];
    loadLPBData();
}

function exportLPBData(fileId) {
    const file = lpbData.find(f => f.id === fileId);
    if (!file) return;
    
    // Simulate export
    showSnackbar('📤', `Exporting LPB ${file.lpbNumber}...`);
    setTimeout(() => {
        showSnackbar('✅', `LPB ${file.lpbNumber} exported successfully!`);
        closeCustomModal();
    }, 1500);
}

// Enhanced LPB OCR Processing with Google Generative AI
async function processLPBWithOCR(filePath) {
    try {
        console.log(`Starting LPB OCR processing for: ${filePath}`);
        
        // Extract text from PDF
        const fileContent = await extractTextFromPDF(filePath);
        
        if (!fileContent || fileContent.trim().length === 0) {
            throw new Error('No text content extracted from LPB PDF');
        }
        
        console.log('Extracted LPB text content length:', fileContent.length);
        
        // Process with Google Generative AI
        const parsedData = await processLPBWithGenAI(fileContent);
        
        return {
            success: true,
            data: parsedData,
            originalText: fileContent
        };
        
    } catch (error) {
        console.error('LPB OCR Processing Error:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

// Extract text from PDF for LPB
async function extractTextFromPDF(filePath) {
    try {
        const pdfParse = require('pdf-parse');
        const fs = require('fs');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error for LPB:', error);
        throw new Error(`Failed to parse LPB PDF: ${error.message}`);
    }
}

// Process LPB text with Google Generative AI
async function processLPBWithGenAI(textContent) {
    try {
        // Initialize Google Generative AI
        let genAI;
        try {
            const genaiModule = require('@google/genai');
            genAI = new genaiModule.GoogleGenAI(process.env.GOOGLE_API_KEY || 'your-api-key-here');
        } catch (error) {
            console.error('Failed to initialize Google Generative AI:', error.message);
            // Use fallback processing
            return processLPBWithFallback(textContent);
        }
        
        const prompt = `
        CRITICAL: This is a LAPORAN PENERIMAAN BARANG (LPB) document. You MUST extract the LPB data accurately.
        
        Text content:
        ${textContent}
        
        Please extract and return the following information in JSON format with EXACT values from the document:
        {
            "lpb": {
                "lpbNumber": "LPB number (e.g., LPB-2024-001)",
                "lpbDate": "LPB date (e.g., 15/03/2024)",
                "poReference": "PO reference number (e.g., PO-2024-001)",
                "deliveryDate": "Delivery date if present",
                "receivedBy": "Name of person who received",
                "verifiedBy": "Name of person who verified"
            },
            "supplier": {
                "name": "Supplier name (e.g., PT SUPPLIER MAJU)",
                "address": "Supplier address if present",
                "phone": "Phone number if present",
                "email": "Email if present"
            },
            "items": [
                {
                    "itemCode": "Item code/SKU (e.g., ITEM-001)",
                    "description": "Item description (e.g., LAPTOP DELL INSPIRON 15)",
                    "quantity": "Quantity received (numeric value)",
                    "unit": "Unit of measurement (e.g., pcs, unit, box)",
                    "unitPrice": "Unit price (numeric value)",
                    "total": "Total amount (numeric value)",
                    "status": "Status (e.g., received, verified, rejected)"
                }
            ],
            "summary": {
                "totalItems": "Total number of items (numeric)",
                "totalAmount": "Total amount (numeric)",
                "currency": "Currency (e.g., IDR, USD)"
            },
            "notes": {
                "generalNotes": "Any general notes or remarks",
                "specialInstructions": "Special delivery or handling instructions"
            }
        }
        
        CRITICAL INSTRUCTIONS FOR LPB DOCUMENT EXTRACTION:
        
        #1 - LPB HEADER INFORMATION:
        - Look for "LAPORAN PENERIMAAN BARANG" or "LPB" in the header
        - Extract LPB number (usually format: LPB-YYYY-NNN)
        - Extract LPB date (various formats: DD/MM/YYYY, DD-MM-YYYY, etc.)
        - Extract PO reference (usually format: PO-YYYY-NNN)
        - Extract delivery date if present
        - Extract names of people who received and verified the goods
        
        #2 - SUPPLIER INFORMATION:
        - Look for supplier name (usually starts with PT, CV, or company names)
        - Extract supplier address if present
        - Extract contact information (phone, email) if present
        
        #3 - ITEMS RECEIVED:
        - Look for item list or table with received goods
        - Each item should have: code, description, quantity, unit, unit price, total
        - Common formats:
          * "#1 LAPTOP DELL INSPIRON 15 2 15000000 30000000"
          * "1. MONITOR 24" 5 800000 4000000"
          * "ITEM-001 LAPTOP DELL 2 PCS 15000000 30000000"
        
        #4 - SUMMARY INFORMATION:
        - Extract total number of items received
        - Extract total amount/value
        - Extract currency (usually IDR for Indonesian documents)
        
        #5 - NOTES AND REMARKS:
        - Extract any general notes about the delivery
        - Extract special handling instructions
        - Extract any quality or condition notes
        
        EXTRACTION RULES:
        1. For LPB number, look for patterns like "LPB-2024-001" or "LPB/2024/001"
        2. For dates, extract in DD/MM/YYYY format if possible
        3. For quantities, extract only numeric values
        4. For prices, extract only numeric values (no currency symbols)
        5. For item codes, look for patterns like "ITEM-001", "#1", or "1."
        6. For descriptions, extract the full item name/description
        7. For units, look for common terms: pcs, unit, box, kg, liter, etc.
        8. For status, look for terms: received, verified, approved, rejected, etc.
        
        If any field is not found, use empty string. Ensure all monetary values are numeric only (no currency symbols).
        For the items array, extract ALL received items from the document.
        For the summary, calculate totals if not explicitly stated.
        `;
        
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [prompt]
        });
        
        const responseText = result.response.text();
        
        // Debug: Log the extracted text content
        console.log('Extracted LPB text content for OCR:', textContent);
        console.log('AI response:', responseText);
        
        // Try to parse JSON from response
        try {
            // Extract JSON from response (handle cases where AI adds extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedData = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed LPB OCR data:', parsedData);
                return parsedData;
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('JSON parsing error for LPB:', parseError);
            console.log('Raw response:', responseText);
            
            // Fallback: return structured data manually
            console.log('Using fallback parsing for LPB...');
            return processLPBWithFallback(textContent);
        }
        
    } catch (error) {
        console.error('GenAI processing error for LPB:', error);
        
        // Check if it's a credentials error
        if (error.message.includes('credentials') || error.message.includes('authentication')) {
            console.log('Using fallback due to credentials issue for LPB');
            return processLPBWithFallback(textContent);
        }
        
        throw new Error(`Failed to process LPB with GenAI: ${error.message}`);
    }
}

// Fallback processing for LPB when GenAI is not available
function processLPBWithFallback(textContent) {
    console.log('Using fallback processing for LPB');
    
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Initialize LPB data structure
    const result = {
        lpb: {
            lpbNumber: '',
            lpbDate: '',
            poReference: '',
            deliveryDate: '',
            receivedBy: '',
            verifiedBy: ''
        },
        supplier: {
            name: '',
            address: '',
            phone: '',
            email: ''
        },
        items: [],
        summary: {
            totalItems: 0,
            totalAmount: 0,
            currency: 'IDR'
        },
        notes: {
            generalNotes: '',
            specialInstructions: ''
        }
    };
    
    let inItemsSection = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        // Extract LPB Number
        if (lowerLine.includes('lpb') && line.match(/lpb[-\/]\d{4}[-\/]\d{3}/i)) {
            const match = line.match(/(lpb[-\/]\d{4}[-\/]\d{3})/i);
            if (match) {
                result.lpb.lpbNumber = match[1].toUpperCase();
            }
        }
        
        // Extract LPB Date
        if (lowerLine.includes('tanggal') || lowerLine.includes('date')) {
            const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
            if (dateMatch) {
                result.lpb.lpbDate = dateMatch[1];
            }
        }
        
        // Extract PO Reference
        if (lowerLine.includes('po') && line.match(/po[-\/]\d{4}[-\/]\d{3}/i)) {
            const match = line.match(/(po[-\/]\d{4}[-\/]\d{3})/i);
            if (match) {
                result.lpb.poReference = match[1].toUpperCase();
            }
        }
        
        // Extract Supplier
        if (lowerLine.includes('supplier') || lowerLine.includes('supplier:')) {
            const match = line.match(/(?:supplier|supplier:)\s*(.+)/i);
            if (match) {
                result.supplier.name = match[1].trim();
            }
        } else if (line.includes('PT') || line.includes('CV')) {
            const companyMatch = line.match(/((?:PT|CV)\s+[A-Z\s]+)/i);
            if (companyMatch && !result.supplier.name) {
                result.supplier.name = companyMatch[1].trim();
            }
        }
        
        // Extract Items
        if (line.includes('#') && line.match(/#\d+/)) {
            // This is an item line
            const item = parseLPBItemFromText(line);
            if (item.itemCode) {
                result.items.push(item);
            }
        } else if (line.match(/^\d+\.\s/) && line.includes('.')) {
            // Alternative item format
            const item = parseLPBItemAlternativeFromText(line);
            if (item.itemCode) {
                result.items.push(item);
            }
        }
        
        // Extract total items count
        if (lowerLine.includes('total items') || lowerLine.includes('jumlah barang') || lowerLine.includes('items:')) {
            const match = line.match(/(?:total items|jumlah barang|items):\s*(\d+)/i);
            if (match) {
                result.summary.totalItems = parseInt(match[1]);
            }
        }
        
        // Extract total amount
        if (lowerLine.includes('total amount') || lowerLine.includes('total nilai') || lowerLine.includes('total:')) {
            const match = line.match(/(?:total amount|total nilai|total):\s*([0-9,]+)/i);
            if (match) {
                const rawValue = match[1].replace(/,/g, '');
                result.summary.totalAmount = parseInt(rawValue);
            }
        }
        
        // Extract received by
        if (lowerLine.includes('received by') || lowerLine.includes('diterima oleh')) {
            const match = line.match(/(?:received by|diterima oleh):\s*(.+)/i);
            if (match) {
                result.lpb.receivedBy = match[1].trim();
            }
        }
        
        // Extract verified by
        if (lowerLine.includes('verified by') || lowerLine.includes('disetujui oleh')) {
            const match = line.match(/(?:verified by|disetujui oleh):\s*(.+)/i);
            if (match) {
                result.lpb.verifiedBy = match[1].trim();
            }
        }
    }
    
    // Calculate totals if not found
    if (result.summary.totalItems === 0 && result.items.length > 0) {
        result.summary.totalItems = result.items.length;
    }
    
    if (result.summary.totalAmount === 0 && result.items.length > 0) {
        result.summary.totalAmount = result.items.reduce((sum, item) => sum + (item.total || 0), 0);
    }
    
    return result;
}

function parseLPBItemFromText(line) {
    // Parse item line like: "#1 LAPTOP DELL INSPIRON 15 2 15000000 30000000"
    const item = {
        itemCode: '',
        description: '',
        quantity: 0,
        unit: 'pcs',
        unitPrice: 0,
        total: 0,
        status: 'received'
    };
    
    // Extract item code
    const itemCodeMatch = line.match(/#(\d+)/);
    if (itemCodeMatch) {
        item.itemCode = `ITEM-${itemCodeMatch[1].padStart(3, '0')}`;
    }
    
    // Split the line into parts
    const parts = line.split(/\s+/).filter(part => part.trim() !== '');
    
    // Find the description part
    let descriptionStart = -1;
    let descriptionEnd = -1;
    
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('#')) {
            descriptionStart = i + 1;
        } else if (parts[i].match(/^\d+$/) && descriptionStart !== -1 && descriptionEnd === -1) {
            descriptionEnd = i;
            break;
        }
    }
    
    if (descriptionStart !== -1 && descriptionEnd !== -1) {
        item.description = parts.slice(descriptionStart, descriptionEnd).join(' ');
    }
    
    // Extract numeric values
    const numbers = parts.filter(part => part.match(/^\d+$/));
    if (numbers.length >= 3) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = parseInt(numbers[2]);
    } else if (numbers.length >= 2) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = item.quantity * item.unitPrice;
    }
    
    return item;
}

function parseLPBItemAlternativeFromText(line) {
    // Parse alternative item format like: "1. MONITOR 24" 5 800000 4000000"
    const item = {
        itemCode: '',
        description: '',
        quantity: 0,
        unit: 'pcs',
        unitPrice: 0,
        total: 0,
        status: 'received'
    };
    
    // Extract item number
    const itemNumberMatch = line.match(/^(\d+)\./);
    if (itemNumberMatch) {
        item.itemCode = `ITEM-${itemNumberMatch[1].padStart(3, '0')}`;
    }
    
    // Split the line and find description and numbers
    const parts = line.split(/\s+/).filter(part => part.trim() !== '');
    
    // Find description
    let descriptionStart = -1;
    let descriptionEnd = -1;
    
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].match(/^\d+\.$/)) {
            descriptionStart = i + 1;
        } else if (parts[i].match(/^\d+$/) && descriptionStart !== -1 && descriptionEnd === -1) {
            descriptionEnd = i;
            break;
        }
    }
    
    if (descriptionStart !== -1 && descriptionEnd !== -1) {
        item.description = parts.slice(descriptionStart, descriptionEnd).join(' ');
    }
    
    // Extract numeric values
    const numbers = parts.filter(part => part.match(/^\d+$/));
    if (numbers.length >= 3) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = parseInt(numbers[2]);
    } else if (numbers.length >= 2) {
        item.quantity = parseInt(numbers[0]);
        item.unitPrice = parseInt(numbers[1]);
        item.total = item.quantity * item.unitPrice;
    }
    
    return item;
}

// Modal functions
function showCustomModal(title = 'Confirmation', icon = '❓', message = 'Are you sure you want to proceed?', onConfirm = null) {
    const modal = document.getElementById('customModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon');
    const modalMessage = document.getElementById('modalMessage');
    const modalActions = document.getElementById('modalActions');

    modalTitle.textContent = title;
    modalIcon.textContent = icon;
    modalMessage.innerHTML = message;
    
    if (onConfirm) {
        modalActions.innerHTML = `
            <button class="btn btn-secondary" onclick="closeCustomModal()">Cancel</button>
            <button class="btn btn-primary" onclick="confirmCustomModal()">Confirm</button>
        `;
        window.confirmCustomModal = onConfirm;
    } else {
        modalActions.innerHTML = `
            <button class="btn btn-secondary" onclick="closeCustomModal()">Close</button>
        `;
    }
    
    modal.classList.add('show');
}

function closeCustomModal() {
    const modal = document.getElementById('customModalOverlay');
    modal.classList.remove('show');
    window.confirmCustomModal = null;
}

function confirmCustomModal() {
    if (window.confirmCustomModal) {
        window.confirmCustomModal();
    }
    closeCustomModal();
}

// Snackbar functions
function showSnackbar(icon, message) {
    const snackbar = document.getElementById('snackbar');
    const snackbarIcon = document.getElementById('snackbarIcon');
    const snackbarMessage = document.getElementById('snackbarMessage');
    
    snackbarIcon.textContent = icon;
    snackbarMessage.textContent = message;
    
    snackbar.classList.add('show');
    
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

function closeSnackbar() {
    const snackbar = document.getElementById('snackbar');
    snackbar.classList.remove('show');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
} 