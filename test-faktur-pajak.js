// Test file for Faktur Pajak OCR processing
const { processFakturPajakWithOCR } = require('./src/logic/faktur-pajak.js');

async function testFakturPajakOCR() {
    try {
        console.log('=== Testing Faktur Pajak OCR Processing ===');
        
        // Test with sample PDF file
        const testFilePath = './sample_faktur_pajak.pdf';
        
        console.log(`Processing Faktur Pajak file: ${testFilePath}`);
        
        const result = await processFakturPajakWithOCR(testFilePath);
        
        if (result.success) {
            console.log('✅ Faktur Pajak OCR processing successful!');
            console.log('📋 Extracted Data:');
            console.log(JSON.stringify(result.data, null, 2));
            
            // Display key information
            if (result.data) {
                console.log('\n🧾 Faktur Pajak Summary:');
                console.log(`   Nomor Faktur: ${result.data.faktur?.nomorFaktur || 'N/A'}`);
                console.log(`   Tanggal: ${result.data.faktur?.tanggal || 'N/A'}`);
                console.log(`   Supplier: ${result.data.supplier?.name || 'N/A'}`);
                console.log(`   NPWP: ${result.data.faktur?.npwp || 'N/A'}`);
                console.log(`   Total Items: ${result.data.items?.length || 0}`);
                console.log(`   Total PPN: ${result.data.summary?.totalPPN || 'N/A'}`);
                
                if (result.data.items && result.data.items.length > 0) {
                    console.log('\n📋 Invoice Items:');
                    result.data.items.forEach((item, index) => {
                        console.log(`   ${index + 1}. ${item.itemCode} - ${item.description}`);
                        console.log(`      Quantity: ${item.quantity} ${item.unit}`);
                        console.log(`      Unit Price: ${item.unitPrice}`);
                        console.log(`      Total: ${item.total}`);
                        console.log(`      PPN: ${item.ppn}`);
                    });
                }
            }
        } else {
            console.log('❌ Faktur Pajak OCR processing failed!');
            console.log('Error:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testFakturPajakOCR(); 