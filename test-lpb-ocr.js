// Test file for LPB (Laporan Penerimaan Barang) OCR processing
const { processLPBWithOCR, processLPBWithGenAI, processLPBWithFallback } = require('./src/logic/lpb.js');

async function testLPBOCR() {
    try {
        console.log('=== Testing LPB OCR Processing ===');
        
        // Test with sample PDF file
        const testFilePath = './sample_lpb.pdf';
        
        console.log(`Processing LPB file: ${testFilePath}`);
        
        const result = await processLPBWithOCR(testFilePath);
        
        if (result.success) {
            console.log('✅ LPB OCR processing successful!');
            console.log('📋 Extracted Data:');
            console.log(JSON.stringify(result.data, null, 2));
            
            // Display key information
            if (result.data) {
                console.log('\n📦 LPB Summary:');
                console.log(`   LPB Number: ${result.data.lpb?.lpbNumber || 'N/A'}`);
                console.log(`   Date: ${result.data.lpb?.lpbDate || 'N/A'}`);
                console.log(`   Supplier: ${result.data.supplier?.name || 'N/A'}`);
                console.log(`   PO Reference: ${result.data.lpb?.poReference || 'N/A'}`);
                console.log(`   Total Items: ${result.data.items?.length || 0}`);
                
                if (result.data.items && result.data.items.length > 0) {
                    console.log('\n📋 Received Items:');
                    result.data.items.forEach((item, index) => {
                        console.log(`   ${index + 1}. ${item.itemCode} - ${item.description}`);
                        console.log(`      Quantity: ${item.quantity} ${item.unit}`);
                        console.log(`      Unit Price: ${item.unitPrice}`);
                        console.log(`      Total: ${item.total}`);
                    });
                }
            }
        } else {
            console.log('❌ LPB OCR processing failed!');
            console.log('Error:', result.error);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

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
        
        // Test with GenAI processing
        try {
            const genAIResult = await processLPBWithGenAI(sampleText);
            console.log('✅ GenAI Processing Result:');
            console.log(JSON.stringify(genAIResult, null, 2));
        } catch (error) {
            console.log('⚠️ GenAI processing failed, using fallback...');
        }
        
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
        const { convertOCRDataToLPBFormat } = require('./src/logic/lpb.js');
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
    console.log('🚀 Starting LPB OCR Tests...\n');
    
    await testLPBOCR();
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
    testLPBOCR,
    testLPBTextProcessing,
    testLPBDataConversion,
    testLPBOCRWithDifferentFormats,
    runAllTests
}; 