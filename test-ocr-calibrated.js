// Test OCR functionality with calibrated settings
const { processPOWithOCR } = require('./src/logic/ocr');

async function testCalibratedOCR() {
    try {
        console.log('Testing calibrated OCR functionality...');
        
        // Test with a sample file path
        const testFilePath = './sample_po.pdf'; // You can change this to test with different files
        
        console.log('Processing file:', testFilePath);
        
        const result = await processPOWithOCR(testFilePath);
        
        if (result.success) {
            console.log('OCR Processing successful!');
            console.log('Extracted data:', JSON.stringify(result.data, null, 2));
            
            // Validate key fields
            console.log('\n=== VALIDATION RESULTS ===');
            
            // Check supplier information
            if (result.data.supplier) {
                console.log('Supplier Name:', result.data.supplier.name);
                console.log('Supplier Address:', result.data.supplier.address);
            }
            
            // Check order information
            if (result.data.order) {
                console.log('FPP Number:', result.data.order.fppNumber);
                console.log('Order Date:', result.data.order.orderDate);
                console.log('Delivery Date:', result.data.order.deliveryDate);
            }
            
            // Check financial information
            if (result.data.financial) {
                console.log('Total Purchase Price:', result.data.financial.totalPurchasePrice);
                console.log('Total After Discount:', result.data.financial.totalAfterDiscount);
                console.log('Total Include VAT:', result.data.financial.totalIncludeVAT);
            }
            
            // Check items
            if (result.data.items && result.data.items.length > 0) {
                console.log('\nProduct Items:');
                result.data.items.forEach((item, index) => {
                    console.log(`Item ${index + 1}:`);
                    console.log(`  Product Name: ${item.productName}`);
                    console.log(`  Product Code: ${item.productCode}`);
                    console.log(`  Q_Crt: ${item.qCrt}`);
                    console.log(`  MIN_REC Q_PCS: ${item.minRecQPcs}`);
                    console.log(`  PLU Price: ${item.pluPrice}`);
                    console.log(`  CONT(C) POT A: ${item.contCPotA}`);
                    console.log(`  KET NETT: ${item.ketNett}`);
                    console.log(`  Total: ${item.total}`);
                });
            }
            
            // Check notes
            if (result.data.notes) {
                console.log('\nNotes:');
                console.log('By Letter:', result.data.notes.byLetter);
                if (result.data.notes.nb && result.data.notes.nb.length > 0) {
                    console.log('Numbered Notes:');
                    result.data.notes.nb.forEach(note => console.log(`  ${note}`));
                }
            }
            
        } else {
            console.error('OCR Processing failed:', result.error);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testCalibratedOCR();
}

module.exports = { testCalibratedOCR }; 