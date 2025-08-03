// Simple test untuk memverifikasi OCR product detection
const { processWithGenAI } = require('./src/logic/ocr');

async function testSimpleOCR() {
    try {
        console.log('Testing simple OCR product detection...');
        
        // Sample text dengan multiple products
        const sampleText = `
        PURCHASE ORDER FORM / AUTO
        PT ABC
        
        Supplier Name: EFG PT [2PZ1.J.0400.1.F]
        Address: JAKARTA BARAT
        
        FPP Number: 2PZ1POC25003023
        Order Date: 11-MAR-25
        Delivery Date: 18-MAR-25
        
        # PRODUCT NAME Q_Crt MIN_REC Q_PCS PLU PRICE CONT(C) POT A KET NETT LST TOTAL PLUB QTYB COSTB POT B
        #1 TAS BELANJA 4 27 B, 15 H 4324992 250 1000 0 1000 0 0 0 1.00
        12345678910
        
        #2 PULPEN BIRU 2 10 PCS 15000 100 500 0 500 0 0 0 1.00
        987654321
        
        TOTAL PURCHASE PRICE: 1000000
        TOTAL AFTER DISCOUNT: 990000
        TOTAL INCLUDE VAT: 1098900
        
        By Letter: Satu Juta Sembilan Puluh Delapan Ribu Sembilan Ratus
        `;
        
        console.log('Processing sample text...');
        
        const result = await processWithGenAI(sampleText);
        
        console.log('OCR Processing completed!');
        console.log('Number of items detected:', result.items ? result.items.length : 0);
        
        if (result.items && result.items.length > 0) {
            console.log('\n=== DETECTED PRODUCTS ===');
            result.items.forEach((item, index) => {
                console.log(`\nProduct ${index + 1}:`);
                console.log(`  Name: ${item.productName}`);
                console.log(`  Code: ${item.productCode}`);
                console.log(`  Q_Crt: ${item.qCrt}`);
                console.log(`  MIN_REC Q_PCS: ${item.minRecQPcs}`);
                console.log(`  PLU Price: ${item.pluPrice}`);
                console.log(`  CONT(C) POT A: ${item.contCPotA}`);
                console.log(`  KET NETT: ${item.ketNett}`);
                console.log(`  Total: ${item.total}`);
            });
        } else {
            console.log('\n❌ NO PRODUCTS DETECTED!');
        }
        
        // Check if items array exists
        console.log('\n=== DEBUG INFO ===');
        console.log('Result has items property:', result.hasOwnProperty('items'));
        console.log('Items array type:', typeof result.items);
        console.log('Items array length:', result.items ? result.items.length : 'undefined');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testSimpleOCR();
}

module.exports = { testSimpleOCR }; 