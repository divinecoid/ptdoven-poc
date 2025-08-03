// Test OCR functionality
const { processPOWithOCR } = require('./src/logic/ocr');

async function testOCR() {
    try {
        console.log('Testing OCR functionality...');
        
        // Test with a sample file path
        const testFilePath = './sample_po.pdf'; // You can change this to test with different files
        
        console.log('Processing file:', testFilePath);
        
        const result = await processPOWithOCR(testFilePath);
        
        if (result.success) {
            console.log('OCR Processing successful!');
            console.log('Extracted data:', JSON.stringify(result.data, null, 2));
        } else {
            console.error('OCR Processing failed:', result.error);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testOCR();
}

module.exports = { testOCR }; 