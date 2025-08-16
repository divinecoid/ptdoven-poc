// Test file for LPB (Laporan Penerimaan Barang) OCR processing
const { processLPBWithOCR } = require('./src/logic/lpb.js');

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
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testLPBOCR(); 