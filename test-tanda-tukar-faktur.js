// Test file for Tanda Tukar Faktur OCR processing
const { processTTFWithOCR } = require('./src/logic/tanda-tukar-faktur.js');

async function testTTFOCR() {
    try {
        console.log('=== Testing Tanda Tukar Faktur OCR Processing ===');
        
        // Test with sample PDF file
        const testFilePath = './sample_ttf.pdf';
        
        console.log(`Processing Tanda Tukar Faktur file: ${testFilePath}`);
        
        const result = await processTTFWithOCR(testFilePath);
        
        if (result.success) {
            console.log('✅ Tanda Tukar Faktur OCR processing successful!');
            console.log('📋 Extracted Data:');
            console.log(JSON.stringify(result.data, null, 2));
            
            // Display key information
            if (result.data) {
                console.log('\n🔄 Tanda Tukar Faktur Summary:');
                console.log(`   Nomor TTF: ${result.data.ttf?.nomorTTF || 'N/A'}`);
                console.log(`   Tanggal: ${result.data.ttf?.tanggal || 'N/A'}`);
                console.log(`   Supplier: ${result.data.supplier?.name || 'N/A'}`);
                console.log(`   Faktur Referensi: ${result.data.ttf?.fakturReferensi || 'N/A'}`);
                console.log(`   Total Items: ${result.data.items?.length || 0}`);
                console.log(`   Total Nilai: ${result.data.summary?.totalNilai || 'N/A'}`);
                
                if (result.data.items && result.data.items.length > 0) {
                    console.log('\n📋 Exchange Items:');
                    result.data.items.forEach((item, index) => {
                        console.log(`   ${index + 1}. ${item.itemCode} - ${item.description}`);
                        console.log(`      Quantity: ${item.quantity} ${item.unit}`);
                        console.log(`      Unit Price: ${item.unitPrice}`);
                        console.log(`      Total: ${item.total}`);
                    });
                }
            }
        } else {
            console.log('❌ Tanda Tukar Faktur OCR processing failed!');
            console.log('Error:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testTTFOCR(); 