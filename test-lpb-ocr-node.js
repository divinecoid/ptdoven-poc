// Test file for LPB (Laporan Penerimaan Barang) OCR processing - Node.js version
// This file tests the OCR functions without browser dependencies

// Mock browser environment for Node.js testing
global.document = {
    addEventListener: () => {},
    getElementById: () => null
};

global.window = {
    location: { href: '' }
};

// Import the OCR functions directly
const fs = require('fs');
const path = require('path');

// OCR Processing Functions (extracted from lpb.js)
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

// Test functions
async function testLPBTextProcessing() {
    try {
        console.log('\n=== Testing LPB Text Processing ===');
        
        // Sample LPB text content
        const sampleText = `LAPORAN PENERIMAAN BARANG (LPB)
        
        LPB Number: LPB-2024-001
        Date: 15/03/2024
        Supplier: PT SUPPLIER MAJU
        Address: JAKARTA SELATAN
        Phone: 021-1234567
        
        PO Reference: PO-2024-001
        Delivery Date: 20/03/2024
        
        ITEMS RECEIVED:
        #1 LAPTOP DELL INSPIRON 15 2 15000000 30000000
        #2 MOUSE WIRELESS 10 50000 500000
        #3 KEYBOARD MECHANICAL 5 200000 1000000
        
        TOTAL ITEMS: 3
        TOTAL AMOUNT: 31500000
        
        Received by: John Doe
        Verified by: Jane Smith
        Date: 15/03/2024`;
        
        console.log('Processing sample LPB text...');
        
        // Test with fallback processing
        const fallbackResult = processLPBWithFallback(sampleText);
        console.log('✅ Fallback Processing Result:');
        console.log(JSON.stringify(fallbackResult, null, 2));
        
    } catch (error) {
        console.error('Text processing test failed:', error);
    }
}

async function testLPBDataConversion() {
    try {
        console.log('\n=== Testing LPB Data Conversion ===');
        
        // Sample OCR data
        const sampleOCRData = {
            lpb: {
                lpbNumber: 'LPB-2024-001',
                lpbDate: '15/03/2024',
                poReference: 'PO-2024-001',
                deliveryDate: '20/03/2024',
                receivedBy: 'John Doe',
                verifiedBy: 'Jane Smith'
            },
            supplier: {
                name: 'PT SUPPLIER MAJU',
                address: 'JAKARTA SELATAN',
                phone: '021-1234567',
                email: ''
            },
            items: [
                {
                    itemCode: 'ITEM-001',
                    description: 'LAPTOP DELL INSPIRON 15',
                    quantity: 2,
                    unit: 'pcs',
                    unitPrice: 15000000,
                    total: 30000000,
                    status: 'received'
                },
                {
                    itemCode: 'ITEM-002',
                    description: 'MOUSE WIRELESS',
                    quantity: 10,
                    unit: 'pcs',
                    unitPrice: 50000,
                    total: 500000,
                    status: 'received'
                }
            ],
            summary: {
                totalItems: 2,
                totalAmount: 30500000,
                currency: 'IDR'
            },
            notes: {
                generalNotes: 'All items received in good condition',
                specialInstructions: 'Handle with care'
            }
        };
        
        console.log('Sample OCR Data:');
        console.log(JSON.stringify(sampleOCRData, null, 2));
        
        // Test conversion
        const convertedData = convertOCRDataToLPBFormat(sampleOCRData, 'test_lpb.pdf');
        
        console.log('\n✅ Converted LPB Data:');
        console.log(JSON.stringify(convertedData, null, 2));
        
    } catch (error) {
        console.error('Data conversion test failed:', error);
    }
}

async function testLPBOCRWithDifferentFormats() {
    try {
        console.log('\n=== Testing LPB OCR with Different Formats ===');
        
        const testTexts = [
            // Format 1: Standard LPB
            `LAPORAN PENERIMAAN BARANG (LPB)
            
            LPB Number: LPB-2024-001
            Date: 15/03/2024
            Supplier: PT SUPPLIER MAJU
            PO Reference: PO-2024-001
            
            ITEMS RECEIVED:
            #1 LAPTOP DELL INSPIRON 15 2 15000000 30000000
            #2 MOUSE WIRELESS 10 50000 500000
            
            TOTAL ITEMS: 2
            TOTAL AMOUNT: 30500000`,
            
            // Format 2: Indonesian format
            `LAPORAN PENERIMAAN BARANG
            
            Nomor LPB: LPB-2024-002
            Tanggal: 16/03/2024
            Supplier: CV TOKO MAKMUR
            Referensi PO: PO-2024-002
            
            BARANG YANG DITERIMA:
            #1 PRINTER HP LASERJET 3 2500000 7500000
            #2 TONER HP BLACK 15 150000 2250000
            
            JUMLAH BARANG: 2
            TOTAL NILAI: 9750000`,
            
            // Format 3: Simple format
            `LPB LPB-2024-003
            17/03/2024
            
            Supplier: PT MAJU BERSAMA
            PO: PO-2024-003
            
            Items:
            1. MONITOR 24" 5 800000 4000000
            2. CABLE HDMI 10 25000 250000
            
            Total: 4250000
            Items: 2`
        ];
        
        for (let i = 0; i < testTexts.length; i++) {
            console.log(`\n--- Testing Format ${i + 1} ---`);
            console.log('Input text:');
            console.log(testTexts[i]);
            
            const fallbackResult = processLPBWithFallback(testTexts[i]);
            console.log('\nProcessed result:');
            console.log(JSON.stringify(fallbackResult, null, 2));
        }
        
    } catch (error) {
        console.error('Format testing failed:', error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting LPB OCR Tests (Node.js)...\n');
    
    await testLPBTextProcessing();
    await testLPBDataConversion();
    await testLPBOCRWithDifferentFormats();
    
    console.log('\n✅ All LPB OCR tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    processLPBWithFallback,
    parseLPBItemFromText,
    parseLPBItemAlternativeFromText,
    convertOCRDataToLPBFormat,
    generateSampleItems,
    testLPBTextProcessing,
    testLPBDataConversion,
    testLPBOCRWithDifferentFormats,
    runAllTests
}; 