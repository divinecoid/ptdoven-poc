// Test file for Faktur Pajak OCR processing (Node.js compatible)
// This file tests the enhanced Faktur Pajak OCR functions

// Mock browser environment for Node.js
global.document = {
    getElementById: () => null,
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
};

global.window = {
    location: { href: '' },
    confirm: () => true,
    alert: () => {},
    console: console
};

// Import the Faktur Pajak logic
const fakturPajakLogic = require('./src/logic/faktur-pajak.js');

// Test functions
async function testFakturPajakTextProcessing() {
    console.log('\n=== Testing Faktur Pajak Text Processing ===');
    
    const sampleTexts = [
        `PT SUPPLIER ABC
Jl. Contoh No. 123, Jakarta
NPWP: 12.345.678.9-123.000

FAKTUR PAJAK
Nomor Faktur: FP-2024-001
Tanggal: 15 Januari 2024

1. ITEM-001 Bahan Baku A 100 pcs 50000 5000000 500000
2. ITEM-002 Bahan Baku B 50 pcs 75000 3750000 375000

Total: 8750000
PPN: 875000
Grand Total: 9625000`,

        `CV VENDOR XYZ
Alamat: Jl. Vendor No. 456, Bandung
NPWP: 98.765.432.1-987.000

INVOICE
Invoice Number: INV-2024-002
Date: 20 Januari 2024

#1 PRODUCT-A Komponen Elektronik 25 pcs 120000 3000000 300000
#2 PRODUCT-B Spare Part 75 pcs 80000 6000000 600000

Total Amount: 9000000
Total PPN: 900000
Grand Total: 9900000`
    ];
    
    for (let i = 0; i < sampleTexts.length; i++) {
        console.log(`\n--- Testing Sample ${i + 1} ---`);
        
        try {
            // Test fallback processing
            const fallbackResult = fakturPajakLogic.processFakturPajakWithFallback(sampleTexts[i]);
            
            console.log('✅ Fallback processing successful');
            console.log('📋 Extracted Data:');
            console.log(`   Supplier: ${fallbackResult.supplier?.name || 'N/A'}`);
            console.log(`   Nomor Faktur: ${fallbackResult.invoice?.nomorFaktur || 'N/A'}`);
            console.log(`   Tanggal: ${fallbackResult.invoice?.tanggal || 'N/A'}`);
            console.log(`   NPWP: ${fallbackResult.invoice?.npwp || 'N/A'}`);
            console.log(`   Total PPN: ${fallbackResult.summary?.totalPPN || fallbackResult.invoice?.totalPPN || 'N/A'}`);
            console.log(`   Items found: ${fallbackResult.items?.length || 0}`);
            
            if (fallbackResult.items && fallbackResult.items.length > 0) {
                console.log('\n📦 Items:');
                fallbackResult.items.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.itemCode} - ${item.description}`);
                    console.log(`      Qty: ${item.quantity} ${item.unit}`);
                    console.log(`      Price: ${item.unitPrice}`);
                    console.log(`      Total: ${item.total}`);
                    console.log(`      PPN: ${item.ppn}`);
                });
            }
            
        } catch (error) {
            console.error(`❌ Error processing sample ${i + 1}:`, error.message);
        }
    }
}

async function testFakturPajakDataConversion() {
    console.log('\n=== Testing Faktur Pajak Data Conversion ===');
    
    const sampleOCRData = {
        supplier: {
            name: 'PT SUPPLIER ABC',
            address: 'Jl. Contoh No. 123, Jakarta',
            phone: '021-1234567'
        },
        invoice: {
            nomorFaktur: 'FP-2024-001',
            tanggal: '15 Januari 2024',
            npwp: '12.345.678.9-123.000',
            totalPPN: '875000'
        },
        items: [
            {
                itemCode: 'ITEM-001',
                description: 'Bahan Baku A',
                quantity: '100',
                unitPrice: '50000',
                total: '5000000',
                ppn: '500000',
                unit: 'pcs'
            },
            {
                itemCode: 'ITEM-002',
                description: 'Bahan Baku B',
                quantity: '50',
                unitPrice: '75000',
                total: '3750000',
                ppn: '375000',
                unit: 'pcs'
            }
        ],
        summary: {
            totalAmount: '8750000',
            totalPPN: '875000',
            grandTotal: '9625000'
        }
    };
    
    try {
        const convertedData = fakturPajakLogic.convertFakturPajakOCRDataToFormat(sampleOCRData, 'test_faktur_pajak.pdf');
        
        console.log('✅ Data conversion successful');
        console.log('📋 Converted Data:');
        console.log(`   File ID: ${convertedData.fileId}`);
        console.log(`   File Name: ${convertedData.fileName}`);
        console.log(`   Supplier: ${convertedData.supplier}`);
        console.log(`   Nomor Faktur: ${convertedData.nomorFaktur}`);
        console.log(`   NPWP: ${convertedData.npwp}`);
        console.log(`   Total PPN: ${convertedData.totalPPN}`);
        console.log(`   Status: ${convertedData.status}`);
        console.log(`   Items: ${convertedData.items.length}`);
        
        if (convertedData.items.length > 0) {
            console.log('\n📦 Converted Items:');
            convertedData.items.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.itemCode} - ${item.description}`);
                console.log(`      Qty: ${item.quantity} ${item.unit}`);
                console.log(`      Unit Price: ${item.unitPrice}`);
                console.log(`      Total: ${item.total}`);
                console.log(`      PPN: ${item.ppn}`);
                console.log(`      Status: ${item.status}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error in data conversion:', error.message);
    }
}

async function testFakturPajakOCRWithDifferentFormats() {
    console.log('\n=== Testing Faktur Pajak OCR with Different Formats ===');
    
    const testCases = [
        {
            name: 'Standard Faktur Pajak',
            text: `PT SUPPLIER ABC
NPWP: 12.345.678.9-123.000
FAKTUR PAJAK
Nomor Faktur: FP-2024-001
Tanggal: 15 Januari 2024
1. ITEM-001 Bahan Baku A 100 pcs 50000 5000000 500000
Total: 5000000
PPN: 500000`
        },
        {
            name: 'Invoice Format',
            text: `CV VENDOR XYZ
Tax ID: 98.765.432.1-987.000
INVOICE
Invoice Number: INV-2024-002
Date: 20 Januari 2024
#1 PRODUCT-A Komponen Elektronik 25 pcs 120000 3000000 300000
Total Amount: 3000000
Total PPN: 300000`
        },
        {
            name: 'No. Faktur Format',
            text: `PT TRADING COMPANY
NPWP: 11.222.333.4-111.000
FAKTUR PAJAK
No. Faktur: FP-2024-003
Tanggal: 25 Januari 2024
1. MAT-001 Material Steel 200 kg 25000 5000000 500000
Grand Total: 5500000`
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- Testing: ${testCase.name} ---`);
        
        try {
            const result = fakturPajakLogic.processFakturPajakWithFallback(testCase.text);
            
            console.log('✅ Processing successful');
            console.log(`   Supplier: ${result.supplier?.name || 'N/A'}`);
            console.log(`   Nomor Faktur: ${result.invoice?.nomorFaktur || 'N/A'}`);
            console.log(`   NPWP: ${result.invoice?.npwp || 'N/A'}`);
            console.log(`   Items: ${result.items?.length || 0}`);
            console.log(`   Total PPN: ${result.summary?.totalPPN || result.invoice?.totalPPN || 'N/A'}`);
            
        } catch (error) {
            console.error(`❌ Error processing ${testCase.name}:`, error.message);
        }
    }
}

async function testFakturPajakItemParsing() {
    console.log('\n=== Testing Faktur Pajak Item Parsing ===');
    
    const testLines = [
        '1. ITEM-001 Bahan Baku A 100 pcs 50000 5000000 500000',
        '#1 PRODUCT-A Komponen Elektronik 25 pcs 120000 3000000 300000',
        '1. MAT-001 Material Steel 200 kg 25000 5000000 500000',
        'ITEM-001 Bahan Baku A 100 pcs 50000 5000000 500000',
        'PRODUCT-A Komponen Elektronik 25 pcs 120000 3000000 300000'
    ];
    
    for (let i = 0; i < testLines.length; i++) {
        console.log(`\n--- Testing Line ${i + 1}: "${testLines[i]}" ---`);
        
        try {
            // Test primary parsing
            const primaryResult = fakturPajakLogic.parseFakturPajakItemFromText(testLines[i]);
            
            if (primaryResult) {
                console.log('✅ Primary parsing successful');
                console.log(`   Item Code: ${primaryResult.itemCode}`);
                console.log(`   Description: ${primaryResult.description}`);
                console.log(`   Quantity: ${primaryResult.quantity} ${primaryResult.unit}`);
                console.log(`   Unit Price: ${primaryResult.unitPrice}`);
                console.log(`   Total: ${primaryResult.total}`);
                console.log(`   PPN: ${primaryResult.ppn}`);
            } else {
                console.log('⚠️ Primary parsing failed, trying alternative...');
                
                // Test alternative parsing
                const alternativeResult = fakturPajakLogic.parseFakturPajakItemAlternativeFromText(testLines[i]);
                
                if (alternativeResult) {
                    console.log('✅ Alternative parsing successful');
                    console.log(`   Item Code: ${alternativeResult.itemCode}`);
                    console.log(`   Description: ${alternativeResult.description}`);
                    console.log(`   Quantity: ${alternativeResult.quantity} ${alternativeResult.unit}`);
                    console.log(`   Unit Price: ${alternativeResult.unitPrice}`);
                    console.log(`   Total: ${alternativeResult.total}`);
                    console.log(`   PPN: ${alternativeResult.ppn}`);
                } else {
                    console.log('❌ Both parsing methods failed');
                }
            }
            
        } catch (error) {
            console.error(`❌ Error parsing line ${i + 1}:`, error.message);
        }
    }
}

// Main test function
async function runFakturPajakTests() {
    console.log('🧾 Starting Faktur Pajak OCR Tests...\n');
    
    try {
        await testFakturPajakTextProcessing();
        await testFakturPajakDataConversion();
        await testFakturPajakOCRWithDifferentFormats();
        await testFakturPajakItemParsing();
        
        console.log('\n✅ All Faktur Pajak OCR tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
    }
}

// Run the tests
runFakturPajakTests(); 