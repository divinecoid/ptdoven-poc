// Debug test untuk memverifikasi product detection
const { processWithGenAI } = require('./src/logic/ocr');

async function testOCRDebug() {
    try {
        console.log('=== OCR DEBUG TEST ===');
        
        // Sample text yang sesuai dengan gambar purchase order
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
        
        TOTAL PURCHASE PRICE: 1000000
        TOTAL AFTER DISCOUNT: 990000
        TOTAL INCLUDE VAT: 1098900
        
        By Letter: Satu Juta Sembilan Puluh Delapan Ribu Sembilan Ratus
        `;
        
        console.log('Processing sample text...');
        
        const result = await processWithGenAI(sampleText);
        
        console.log('\n=== EXTRACTED DATA ===');
        console.log('Result type:', typeof result);
        console.log('Result keys:', Object.keys(result));
        
        if (result.items) {
            console.log('\n=== PRODUCT ITEMS ===');
            console.log('Items array type:', typeof result.items);
            console.log('Items array length:', result.items.length);
            console.log('Items array:', JSON.stringify(result.items, null, 2));
            
            if (result.items.length > 0) {
                console.log('\n=== FIRST PRODUCT DETAILS ===');
                const firstItem = result.items[0];
                console.log('Product Name:', firstItem.productName);
                console.log('Product Code:', firstItem.productCode);
                console.log('Q_Crt:', firstItem.qCrt);
                console.log('MIN_REC Q_PCS:', firstItem.minRecQPcs);
                console.log('PLU Price:', firstItem.pluPrice);
                console.log('CONT(C) POT A:', firstItem.contCPotA);
                console.log('KET NETT:', firstItem.ketNett);
                console.log('Total:', firstItem.total);
                
                // Validate against expected values
                console.log('\n=== VALIDATION ===');
                console.log('Product Name Match:', firstItem.productName === '#1 TAS BELANJA');
                console.log('Product Code Match:', firstItem.productCode === '12345678910');
                console.log('Q_Crt Match:', firstItem.qCrt === '4');
                console.log('MIN_REC Q_PCS Match:', firstItem.minRecQPcs === '27 B, 15 H');
                console.log('PLU Price Match:', firstItem.pluPrice === '4324992');
                console.log('CONT(C) POT A Match:', firstItem.contCPotA === '250');
                console.log('KET NETT Match:', firstItem.ketNett === '1000');
                console.log('Total Match:', firstItem.total === '1000');
            } else {
                console.log('❌ NO PRODUCTS DETECTED!');
            }
        } else {
            console.log('❌ NO ITEMS ARRAY FOUND!');
        }
        
        // Check if result has the expected structure
        console.log('\n=== STRUCTURE CHECK ===');
        console.log('Has supplier:', result.hasOwnProperty('supplier'));
        console.log('Has order:', result.hasOwnProperty('order'));
        console.log('Has financial:', result.hasOwnProperty('financial'));
        console.log('Has items:', result.hasOwnProperty('items'));
        console.log('Has notes:', result.hasOwnProperty('notes'));
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Error stack:', error.stack);
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testOCRDebug();
}

module.exports = { testOCRDebug }; 