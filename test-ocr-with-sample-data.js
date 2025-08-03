// Test OCR functionality with sample data that matches the correct purchase order
const { processWithGenAI } = require('./src/logic/ocr');

async function testOCRWithSampleData() {
    try {
        console.log('Testing OCR with sample data that matches the correct purchase order...');
        
        // Sample text that represents the correct data from the purchase order image
        const sampleText = `
        PURCHASE ORDER FORM / AUTO
        PT ABC
        
        Supplier Name: EFG PT [2PZ1.J.0400.1.F]
        Address: JAKARTA BARAT
        Phone Number: 
        Fax: 
        
        Palet: 
        Vehicle Number: 
        FPP Number: 2PZ1POC25003023
        Order Date: 11-MAR-25
        Delivery Date: 18-MAR-25
        Hour Schedule: 08.30, Door: 4
        Process 11-MAR-25 Jam 00:00:00
        
        Please deliver our ordered goods, such as the following details to TANGERANG
        PAKULONAN SERPONG TANGERANG
        
        # PRODUCT NAME Q_Crt MIN_REC Q_PCS PLU PRICE CONT(C) POT A KET NETT LST TOTAL PLUB QTYB COSTB POT B
        #1 TAS BELANJA 4 27 B, 15 H 4324992 250 1000 0 1000 0 0 0 1.00
        12345678910
        
        INVOICE DISC: 0.00% 0.00%
        TOTAL PURCHASE PRICE: 1000000
        TOTAL ITEM DISCOUNT: 10000
        TOTAL INVOICE DISCOUNT: 0(-)
        TOTAL AFTER DISCOUNT: 990000
        TOTAL BONUS: 0
        TOTAL LST: 0
        TOTAL VAT INPUT: 108900(+)
        TOTAL INCLUDE VAT: 1098900
        TOTAL INVOICE: 1098900
        
        By Letter: Satu Juta Sembilan Puluh Delapan Ribu Sembilan Ratus
        
        #: Sudah ada print barcode externalnya.
        T/T BCA AC. 123456789 A/N EFG PT
        
        ( AUTO )
        ( B2B )
        
        1. If PO is Expired do not deliver the goods, unless there are confirmation from supplier to TANGERANG.
        2. At the time of delivery please include FPP
        3. Goods delivery only for one FPP Number if there is FPP
        `;
        
        console.log('Processing sample text with calibrated OCR...');
        
        const result = await processWithGenAI(sampleText);
        
        console.log('OCR Processing completed!');
        console.log('Extracted data:', JSON.stringify(result, null, 2));
        
        // Validate key fields against expected values
        console.log('\n=== VALIDATION RESULTS ===');
        
        // Check supplier information
        if (result.supplier) {
            console.log('Supplier Name:', result.supplier.name);
            console.log('Expected: EFG PT [2PZ1.J.0400.1.F]');
            console.log('Match:', result.supplier.name === 'EFG PT [2PZ1.J.0400.1.F]');
            
            console.log('Supplier Address:', result.supplier.address);
            console.log('Expected: JAKARTA BARAT');
            console.log('Match:', result.supplier.address === 'JAKARTA BARAT');
        }
        
        // Check order information
        if (result.order) {
            console.log('FPP Number:', result.order.fppNumber);
            console.log('Expected: 2PZ1POC25003023');
            console.log('Match:', result.order.fppNumber === '2PZ1POC25003023');
            
            console.log('Order Date:', result.order.orderDate);
            console.log('Expected: 11-MAR-25');
            console.log('Match:', result.order.orderDate === '11-MAR-25');
            
            console.log('Delivery Date:', result.order.deliveryDate);
            console.log('Expected: 18-MAR-25');
            console.log('Match:', result.order.deliveryDate === '18-MAR-25');
        }
        
        // Check financial information
        if (result.financial) {
            console.log('Total Purchase Price:', result.financial.totalPurchasePrice);
            console.log('Expected: 1000000');
            console.log('Match:', result.financial.totalPurchasePrice === '1000000');
            
            console.log('Total After Discount:', result.financial.totalAfterDiscount);
            console.log('Expected: 990000');
            console.log('Match:', result.financial.totalAfterDiscount === '990000');
            
            console.log('Total Include VAT:', result.financial.totalIncludeVAT);
            console.log('Expected: 1098900');
            console.log('Match:', result.financial.totalIncludeVAT === '1098900');
        }
        
        // Check items
        if (result.items && result.items.length > 0) {
            console.log('\nProduct Items:');
            const item = result.items[0];
            console.log('Product Name:', item.productName);
            console.log('Expected: #1 TAS BELANJA');
            console.log('Match:', item.productName === '#1 TAS BELANJA');
            
            console.log('Product Code:', item.productCode);
            console.log('Expected: 12345678910');
            console.log('Match:', item.productCode === '12345678910');
            
            console.log('Q_Crt:', item.qCrt);
            console.log('Expected: 4');
            console.log('Match:', item.qCrt === '4');
            
            console.log('MIN_REC Q_PCS:', item.minRecQPcs);
            console.log('Expected: 27 B, 15 H');
            console.log('Match:', item.minRecQPcs === '27 B, 15 H');
            
            console.log('PLU Price:', item.pluPrice);
            console.log('Expected: 4324992');
            console.log('Match:', item.pluPrice === '4324992');
            
            console.log('CONT(C) POT A:', item.contCPotA);
            console.log('Expected: 250');
            console.log('Match:', item.contCPotA === '250');
            
            console.log('KET NETT:', item.ketNett);
            console.log('Expected: 1000');
            console.log('Match:', item.ketNett === '1000');
            
            console.log('Total:', item.total);
            console.log('Expected: 1000');
            console.log('Match:', item.total === '1000');
        }
        
        // Check notes
        if (result.notes) {
            console.log('\nNotes:');
            console.log('By Letter:', result.notes.byLetter);
            console.log('Expected: Satu Juta Sembilan Puluh Delapan Ribu Sembilan Ratus');
            console.log('Match:', result.notes.byLetter === 'Satu Juta Sembilan Puluh Delapan Ribu Sembilan Ratus');
            
            if (result.notes.nb && result.notes.nb.length > 0) {
                console.log('Numbered Notes:');
                result.notes.nb.forEach((note, index) => {
                    console.log(`  Note ${index + 1}: ${note}`);
                });
            }
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testOCRWithSampleData();
}

module.exports = { testOCRWithSampleData }; 