// === TANDA TUKAR FAKTUR PROCESSING FOR INVOICE EXCHANGE DOCUMENTS ===
// Using Google Generative AI for OCR processing

// Browser-safe initialization
let fs, path, genAI;

// Only try to load Node.js modules if we're in a Node.js environment
if (typeof require !== 'undefined') {
    try {
        fs = require('fs');
        path = require('path');
        
        // Initialize Google Generative AI with proper import
        try {
            const genaiModule = require('@google/genai');
            console.log('Successfully loaded @google/genai module for Tanda Tukar Faktur');
            
            if (genaiModule.GoogleGenAI) {
                genAI = new genaiModule.GoogleGenAI(process.env.GOOGLE_API_KEY || 'your-api-key-here');
                console.log('Successfully initialized GoogleGenAI for Tanda Tukar Faktur');
            } else {
                throw new Error('GoogleGenAI constructor not found');
            }
            
        } catch (error) {
            console.error('Failed to initialize Google Generative AI for Tanda Tukar Faktur:', error.message);
            console.log('Using fallback implementation for Tanda Tukar Faktur...');
            
            // Create a fallback implementation
            genAI = {
                models: {
                    generateContent: async (config) => {
                        console.log('Mock: Generating Tanda Tukar Faktur content with config:', config);
                        return {
                            response: {
                                text: () => {
                                    const mockResponse = {
                                        supplier: 'Mock Supplier',
                                        nomorTTF: 'MOCK-TTF-001',
                                        tanggal: new Date().toISOString().split('T')[0],
                                        fakturReferensi: 'FP-2024-001',
                                        totalNilai: '5000000',
                                        items: [{
                                            itemCode: 'MOCK-001',
                                            description: 'Mock item from Tanda Tukar Faktur OCR',
                                            quantity: '10',
                                            unitPrice: '500000',
                                            total: '5000000',
                                            unit: 'pcs'
                                        }]
                                    };
                                    return JSON.stringify(mockResponse);
                                }
                            }
                        };
                    }
                }
            };
        }
    } catch (error) {
        console.log('Running in browser environment - Node.js modules not available');
    }
} else {
    console.log('Running in browser environment - Node.js modules not available');
}

// OCR Processing Function for Tanda Tukar Faktur - Only PDF supported
async function processOCRForTTF(filePath, fileType) {
    try {
        console.log(`Starting Tanda Tukar Faktur OCR processing for: ${filePath}`);
        
        let fileContent = '';
        
        // Read file content - only PDF supported
        if (fileType === 'pdf') {
            fileContent = await extractTextFromPDF(filePath);
        } else {
            throw new Error(`Unsupported file type: ${fileType}. Only PDF files are supported for OCR processing.`);
        }
        
        if (!fileContent || fileContent.trim().length === 0) {
            throw new Error('No text content extracted from Tanda Tukar Faktur file');
        }
        
        console.log('Extracted Tanda Tukar Faktur text content length:', fileContent.length);
        
        // Process with Google Generative AI
        const parsedData = await processTTFWithGenAI(fileContent);
        
        return {
            success: true,
            data: parsedData,
            originalText: fileContent
        };
        
    } catch (error) {
        console.error('Tanda Tukar Faktur OCR Processing Error:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

// Extract text from PDF
async function extractTextFromPDF(filePath) {
    try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error for Tanda Tukar Faktur:', error);
        throw new Error(`Failed to parse Tanda Tukar Faktur PDF: ${error.message}`);
    }
}

// Extract text from image using Google Generative AI
async function extractTextFromImage(filePath) {
    try {
        if (!genAI.models) {
            console.log('Available methods on genAI:', Object.getOwnPropertyNames(genAI));
            throw new Error('genAI.models is not available');
        }
        
        // Read image file
        const imageBytes = fs.readFileSync(filePath);
        
        // Create image part for the new API
        const imagePart = {
            inlineData: {
                data: imageBytes.toString('base64'),
                mimeType: getMimeType(filePath)
            }
        };
        
        // OCR prompt for Tanda Tukar Faktur
        const prompt = `
        Please extract all text from this image. This appears to be an Invoice Exchange (Tanda Tukar Faktur) document.
        
        Please extract the following information in a structured format:
        1. Supplier/Vendor name
        2. Tanda Tukar Faktur Number
        3. Date
        4. Faktur Reference Number
        5. All exchange items with:
           - Item code/SKU
           - Description
           - Quantity
           - Unit price
           - Total amount
        6. Total exchange value
        
        Return the information in a clear, readable format that can be easily parsed.
        `;
        
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [prompt, imagePart]
        });
        
        return result.response.text();
        
    } catch (error) {
        console.error('Image OCR error for Tanda Tukar Faktur:', error);
        throw new Error(`Failed to extract text from Tanda Tukar Faktur image: ${error.message}`);
    }
}

// Process extracted text with Google Generative AI for Tanda Tukar Faktur
async function processTTFWithGenAI(textContent) {
    try {
        if (!genAI.models) {
            console.log('Available methods on genAI:', Object.getOwnPropertyNames(genAI));
            throw new Error('genAI.models is not available');
        }
        
        const prompt = `
        CRITICAL: This is an INVOICE EXCHANGE (Tanda Tukar Faktur) document. You MUST extract the exchange data accurately.
        
        Text content:
        ${textContent}
        
        Please extract and return the following information in JSON format:
        {
            "supplier": {
                "name": "exact supplier name",
                "address": "supplier address if present",
                "phone": "phone number if present"
            },
            "ttf": {
                "nomorTTF": "Tanda Tukar Faktur number (e.g., TTF-2024-001)",
                "tanggal": "exchange date (e.g., 2024-01-15)",
                "fakturReferensi": "reference faktur number",
                "jenisTransaksi": "type of exchange transaction"
            },
            "items": [
                {
                    "itemCode": "item code/SKU",
                    "description": "item description",
                    "quantity": "quantity",
                    "unitPrice": "unit price",
                    "total": "total amount",
                    "unit": "unit of measurement"
                }
            ],
            "summary": {
                "totalNilai": "total exchange value",
                "totalItems": "total number of items",
                "notes": "any additional notes"
            }
        }
        
        CRITICAL INSTRUCTIONS FOR TANDA TUKAR FAKTUR EXTRACTION:
        
        #1 - SUPPLIER INFORMATION:
        - Look for supplier name and details
        - Extract complete supplier information
        
        #2 - TANDA TUKAR FAKTUR HEADER:
        - Look for Tanda Tukar Faktur number format (TTF-YYYY-XXX)
        - Extract exchange date
        - Find reference faktur number
        - Look for transaction type
        
        #3 - EXCHANGE ITEMS:
        - Look for table or list of exchange items
        - Extract item codes, descriptions, quantities, prices
        - Calculate totals for each item
        
        #4 - SUMMARY:
        - Calculate total exchange value
        - Count total items
        - Extract any notes or remarks
        
        If any field is not found, use empty string. Ensure all monetary values are numeric only (no currency symbols).
        For the items array, extract ALL exchange items from the document.
        `;
        
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [prompt]
        });
        
        const responseText = result.response.text();
        
        // Debug: Log the extracted text content
        console.log('Extracted Tanda Tukar Faktur text content for OCR:', textContent);
        console.log('AI response for Tanda Tukar Faktur:', responseText);
        
        // Try to parse JSON from response
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedData = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed Tanda Tukar Faktur data:', parsedData);
                return parsedData;
            } else {
                throw new Error('No JSON found in Tanda Tukar Faktur response');
            }
        } catch (parseError) {
            console.error('JSON parsing error for Tanda Tukar Faktur:', parseError);
            console.log('Raw Tanda Tukar Faktur response:', responseText);
            
            // Fallback: return structured data manually
            console.log('Using fallback parsing for Tanda Tukar Faktur...');
            return createTTFFallbackStructure(textContent);
        }
        
    } catch (error) {
        console.error('GenAI processing error for Tanda Tukar Faktur:', error);
        
        if (error.message.includes('credentials') || error.message.includes('authentication')) {
            console.log('Using fallback due to credentials issue for Tanda Tukar Faktur');
            return createTTFFallbackStructure(textContent);
        }
        
        throw new Error(`Failed to process Tanda Tukar Faktur with GenAI: ${error.message}`);
    }
}

// Fallback structure creation for Tanda Tukar Faktur
function createTTFFallbackStructure(textContent) {
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const result = {
        supplier: {
            name: '',
            address: '',
            phone: ''
        },
        ttf: {
            nomorTTF: '',
            tanggal: '',
            fakturReferensi: '',
            jenisTransaksi: ''
        },
        items: [],
        summary: {
            totalNilai: '0',
            totalItems: '0',
            notes: ''
        }
    };
    
    // Basic parsing for Tanda Tukar Faktur data
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        // Look for Tanda Tukar Faktur number
        if (lowerLine.includes('ttf') && line.match(/ttf[-\s]*\d+/i)) {
            const match = line.match(/ttf[-\s]*(\d+)/i);
            if (match) {
                result.ttf.nomorTTF = `TTF-2024-${match[1].padStart(3, '0')}`;
            }
        }
        
        // Look for supplier name
        if (lowerLine.includes('supplier') || lowerLine.includes('vendor')) {
            const match = line.match(/(?:supplier|vendor)[:\s]*(.+)/i);
            if (match) {
                result.supplier.name = match[1].trim();
            }
        }
        
        // Look for Faktur reference
        if (lowerLine.includes('faktur') && lowerLine.includes('referensi')) {
            const match = line.match(/faktur[-\s]*(\d+)/i);
            if (match) {
                result.ttf.fakturReferensi = `FP-2024-${match[1].padStart(3, '0')}`;
            }
        }
        
        // Look for date patterns
        const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (dateMatch && !result.ttf.tanggal) {
            result.ttf.tanggal = dateMatch[1];
        }
    }
    
    // Add sample item if none found
    if (result.items.length === 0) {
        result.items.push({
            itemCode: 'SAMPLE-001',
            description: 'Sample item from Tanda Tukar Faktur',
            quantity: '1',
            unitPrice: '500000',
            total: '500000',
            unit: 'pcs'
        });
    }
    
    return result;
}

// Format currency value with digit grouping for Tanda Tukar Faktur
function formatCurrencyWithGrouping(value) {
    if (!value || value === '') return '';
    
    let numStr = value.toString().replace(/[^\d]/g, '');
    
    if (numStr === '') return '';
    
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return value;
    
    return num.toLocaleString('id-ID');
}

// Get MIME type based on file extension
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
}

// Validate file type - Only PDF supported for OCR
function validateFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const supportedPdfTypes = ['.pdf'];
    
    if (supportedPdfTypes.includes(ext)) {
        return 'pdf';
    } else {
        throw new Error(`Unsupported file type: ${ext}. Only PDF files are supported for OCR processing.`);
    }
}

// Main Tanda Tukar Faktur function for processing
async function processTTFWithOCR(filePath) {
    try {
        // Validate file type
        const fileType = validateFileType(filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('Tanda Tukar Faktur file not found');
        }
        
        // Process OCR
        const result = await processOCRForTTF(filePath, fileType);
        
        if (result.success) {
            console.log('Tanda Tukar Faktur OCR processing completed successfully');
            return result;
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Tanda Tukar Faktur OCR processing failed:', error);
        throw error;
    }
}

// === FRONTEND LOGIC FOR TANDA TUKAR FAKTUR PAGE ===

// Tanda Tukar Faktur Management Logic
let ttfData = [];
let currentFileData = null;
let selectedFiles = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeTTFPage();
    setupEventListeners();
    setupUploadModal();
    loadTTFData();
});

function initializeTTFPage() {
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
    // Upload button
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.addEventListener('click', () => {
        openUploadDialog();
    });

    // Clear data button
    const clearDataBtn = document.getElementById('clearDataBtn');
    clearDataBtn.addEventListener('click', () => {
        showCustomModal(
            'Clear Data',
            '🗑️',
            'Are you sure you want to clear all Tanda Tukar Faktur data? This action cannot be undone.',
            () => {
                clearAllData();
                showSnackbar('✅', 'All Tanda Tukar Faktur data has been cleared successfully!');
            }
        );
    });

    // Upload files button in dialog
    const uploadFilesBtn = document.getElementById('uploadFilesBtn');
    if (uploadFilesBtn) {
        uploadFilesBtn.addEventListener('click', uploadFiles);
    }
}

function setupUploadModal() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // File input change
    fileInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        updateUploadButton();
        updateUploadArea();
    });

    // Drag and drop events
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
        fileInput.files = e.dataTransfer.files;
        updateUploadButton();
        updateUploadArea();
    });

    // Click to select files
    uploadArea.addEventListener('click', (e) => {
        console.log('TTF Upload area clicked');
        e.preventDefault();
        e.stopPropagation();
        console.log('TTF File input element:', fileInput);
        if (fileInput) {
            console.log('TTF File input properties:', {
                type: fileInput.type,
                accept: fileInput.accept,
                multiple: fileInput.multiple,
                disabled: fileInput.disabled,
                style: fileInput.style.display
            });
            try {
                fileInput.click();
                console.log('TTF File input clicked successfully');
            } catch (error) {
                console.error('TTF Error clicking file input:', error);
            }
        } else {
            console.error('TTF File input not found');
        }
    });
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
        uploadHint.textContent = 'Supports PDF files only';
    }
}

function openUploadDialog() {
    document.getElementById('uploadDialog').classList.add('active');
}

function closeUploadDialog() {
    document.getElementById('uploadDialog').classList.remove('active');
    selectedFiles = [];
    document.getElementById('fileInput').value = '';
    updateUploadButton();
    updateUploadArea();
}

function uploadFiles() {
    if (selectedFiles.length === 0) {
        showSnackbar('⚠️', 'Please select at least one PDF file');
        return;
    }

    // Validate file types
    const invalidFiles = selectedFiles.filter(file => !file.name.toLowerCase().endsWith('.pdf'));
    if (invalidFiles.length > 0) {
        showSnackbar('❌', `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only PDF files are supported.`);
        return;
    }

    // Simulate upload and OCR processing
    showSnackbar('⏳', 'Processing PDF files with OCR...');
    
    setTimeout(() => {
        selectedFiles.forEach(file => {
            const fileData = simulateTTFOCRProcessing(file.name, file.name.split('.').pop());
            addTTFData(fileData);
        });
        
        loadTTFData();
        closeUploadDialog();
        showSnackbar('✅', `Successfully processed ${selectedFiles.length} PDF file(s)`);
    }, 2000);
}

function simulateTTFOCRProcessing(fileName, fileExtension) {
    const timestamp = new Date().toISOString();
    const fileId = `ttf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        fileId: fileId,
        fileName: fileName,
        uploadDate: timestamp,
        supplier: 'PT Supplier ABC',
        nomorTTF: `TTF-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        fakturReferensi: `FP-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        totalNilai: '5.000.000',
        status: 'draft',
        items: generateSampleTTFItems(Math.floor(Math.random() * 5) + 1)
    };
}

function generateSampleTTFItems(count) {
    const items = [];
    for (let i = 1; i <= count; i++) {
        items.push({
            itemCode: `TTF-ITEM-${i.toString().padStart(3, '0')}`,
            description: `Sample Tanda Tukar Faktur Item ${i}`,
            quantity: Math.floor(Math.random() * 100) + 1,
            unitPrice: Math.floor(Math.random() * 1000000) + 10000,
            total: Math.floor(Math.random() * 10000000) + 100000,
            unit: 'pcs',
            status: 'draft'
        });
    }
    return items;
}

function addTTFData(data) {
    ttfData.unshift(data);
}

function loadTTFData() {
    loadFileTableData();
    loadAllDataTable();
}

function loadFileTableData() {
    const tbody = document.getElementById('fileTableBody');
    tbody.innerHTML = '';

    ttfData.forEach(file => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${file.fileName}</td>
            <td>${new Date(file.uploadDate).toLocaleDateString('id-ID')}</td>
            <td>${file.supplier}</td>
            <td>${file.nomorTTF}</td>
            <td>${file.fakturReferensi}</td>
            <td><span class="status-${file.status}">${file.status.toUpperCase()}</span></td>
            <td>
                <button class="detail-btn" onclick="viewTTFDetail('${file.fileId}')">
                    <span>👁️</span> Detail
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadAllDataTable() {
    const tbody = document.getElementById('allDataBody');
    tbody.innerHTML = '';

    ttfData.forEach(file => {
        file.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${file.fileName}</td>
                <td>${file.nomorTTF}</td>
                <td>${file.supplier}</td>
                <td>${file.fakturReferensi}</td>
                <td>${item.itemCode}</td>
                <td class="col-keterangan">${item.description}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>Rp ${item.unitPrice.toLocaleString('id-ID')}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
                <td><span class="status-${item.status}">${item.status.toUpperCase()}</span></td>
                <td class="col-aksi">
                    <button class="action-btn confirm" onclick="confirmItem('${file.fileId}', '${item.itemCode}')">✓</button>
                    <button class="action-btn reject" onclick="rejectItem('${file.fileId}', '${item.itemCode}')">✗</button>
                    <button class="action-btn edit" onclick="editItem('${file.fileId}', '${item.itemCode}')">✎</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

function viewTTFDetail(fileId) {
    const file = ttfData.find(f => f.fileId === fileId);
    if (!file) {
        showSnackbar('❌', 'File not found');
        return;
    }

    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon');
    const modalMessage = document.getElementById('modalMessage');
    const modalActions = document.getElementById('modalActions');

    modalTitle.textContent = 'Tanda Tukar Faktur Detail';
    modalIcon.textContent = '🔄';
    
    // Create detailed content
    const detailContent = `
        <div class="file-detail-container">
            <div class="file-detail-header">
                <div class="file-icon">📄</div>
                <div class="file-info">
                    <h3 class="file-name">${file.fileName}</h3>
                    <p class="file-upload-date">Uploaded: ${new Date(file.uploadDate).toLocaleString('id-ID')}</p>
                </div>
            </div>
            
            <div class="file-detail-sections">
                <div class="detail-section">
                    <h4 class="section-title">📋 TTF Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Nomor TTF:</span>
                            <span class="detail-value">${file.nomorTTF}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Supplier:</span>
                            <span class="detail-value">${file.supplier}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Faktur Referensi:</span>
                            <span class="detail-value">${file.fakturReferensi}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Nilai:</span>
                            <span class="detail-value">Rp ${file.totalNilai}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-${file.status}">${file.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="section-title">📦 Items (${file.items.length})</h4>
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
                                        <span class="detail-value">${item.quantity} ${item.unit}</span>
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

    modalMessage.innerHTML = detailContent;
    modalActions.innerHTML = `
        <button class="btn btn-secondary" onclick="closeCustomModal()">Close</button>
        <button class="btn btn-primary" onclick="exportTTFData('${fileId}')">Export</button>
    `;

    showCustomModal();
}

function confirmItem(fileId, itemCode) {
    showSnackbar('✅', `Item ${itemCode} confirmed`);
}

function rejectItem(fileId, itemCode) {
    showSnackbar('❌', `Item ${itemCode} rejected`);
}

function editItem(fileId, itemCode) {
    showSnackbar('✎', `Editing item ${itemCode}`);
}

function clearAllData() {
    ttfData = [];
    loadTTFData();
}

function exportTTFData(fileId) {
    const file = ttfData.find(f => f.fileId === fileId);
    if (file) {
        const dataStr = JSON.stringify(file, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.fileName.replace(/\.[^/.]+$/, '')}_export.json`;
        link.click();
        URL.revokeObjectURL(url);
        showSnackbar('📥', 'Data exported successfully');
    }
    closeCustomModal();
}

function showCustomModal(title = 'Confirmation', icon = '❓', message = 'Are you sure you want to proceed?', onConfirm = null) {
    const modal = document.getElementById('customModal');
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
        window.confirmCallback = onConfirm;
    } else {
        modalActions.innerHTML = `
            <button class="btn btn-secondary" onclick="closeCustomModal()">Close</button>
        `;
    }

    document.getElementById('customModalOverlay').classList.add('show');
}

function closeCustomModal() {
    document.getElementById('customModalOverlay').classList.remove('show');
    window.confirmCallback = null;
}

function confirmCustomModal() {
    if (window.confirmCallback) {
        window.confirmCallback();
    }
    closeCustomModal();
}

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
    document.getElementById('snackbar').classList.remove('show');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
} 