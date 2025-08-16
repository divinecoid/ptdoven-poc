// Test file to verify genAI initialization fix for Faktur Pajak
console.log('Testing genAI initialization fix for Faktur Pajak...');

// Mock browser environment
global.window = {};
global.document = {
    getElementById: () => null,
    addEventListener: () => {},
    createElement: () => ({ addEventListener: () => {} }),
    querySelector: () => null
};

// Load the faktur-pajak logic
const fakturPajakLogic = require('./src/logic/faktur-pajak.js');

console.log('✅ Faktur Pajak logic loaded successfully');

// Test the genAI object
console.log('Testing genAI object...');
console.log('genAI type:', typeof fakturPajakLogic.genAI);
console.log('genAI.models:', fakturPajakLogic.genAI?.models);

// Test the processFakturPajakWithGenAI function
async function testGenAIProcessing() {
    try {
        console.log('\nTesting processFakturPajakWithGenAI...');
        
        const sampleText = `
        FAKTUR PAJAK
        Nama: PT EFG
        Alamat: JAKARTA BARAT 1234567890
        Kode dan nomor seri faktur pajak: 00000000000000001
        
        Data Beli:
        Nama: PT ABC
        Alamat: TANGERANG
        NPWP: 1112131415
        
        Product Table:
        1. PROD-001 - Laptop - 5000000
        2. PROD-002 - Mouse - 100000
        3. PROD-003 - Keyboard - 200000
        
        Summary:
        Harga Jual/Penggantian/Uang Muka/Termin: 5300000
        Dikurangi Potongan Harga: 0
        Dikurangi Uang Muka yang telah diterima: 0
        Dasar Pengenaan Pajak: 5300000
        Jumlah PPN: 530000
        Jumlah PPnBM: 0
        `;
        
        const result = await fakturPajakLogic.processFakturPajakWithGenAI(sampleText);
        console.log('✅ GenAI processing successful!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ GenAI processing failed:', error.message);
        console.error('Error details:', error);
    }
}

// Run the test
testGenAIProcessing().catch(console.error); 