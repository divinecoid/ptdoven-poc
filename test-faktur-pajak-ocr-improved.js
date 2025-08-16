// Test file for improved Faktur Pajak OCR processing
// Testing the specific attributes mentioned by the user

// Mock browser environment
global.document = {
    getElementById: () => ({
        disabled: false,
        textContent: '',
        querySelector: () => ({
            textContent: '',
            querySelector: () => ({ textContent: '' })
        })
    }),
    createElement: () => ({
        appendChild: () => {},
        setAttribute: () => {},
        addEventListener: () => {}
    }),
    querySelector: () => ({
        appendChild: () => {},
        setAttribute: () => {},
        addEventListener: () => {}
    }),
    addEventListener: () => {}
};

global.window = {
    location: { href: '' },
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    }
};

// Import the Faktur Pajak logic
const fakturPajakLogic = require('./src/logic/faktur-pajak.js');

// Sample text that matches the user's requirements
const sampleFakturPajakText = `
FAKTUR PAJAK

Nama: PT EFG
Alamat: JAKARTA BARAT 1234567890
Kode dan nomor seri faktur pajak: 00000000000000001

Data Beli:
Nama: PT ABC
Alamat: TANGERANG
NPWP: 1112131415

No. Kode Barang/Jasa Nama Barang Kena Pajak/Jasa Kena Pajak Harga Jual/Penggantian/Uang Muka/Termin (Rp)
1. PROD-001 Komponen Elektronik 1200000
2. PROD-002 Spare Part 800000
3. PROD-003 Material Steel 1500000

Harga Jual/Penggantian/Uang Muka/Termin: 3500000
Dikurangi Potongan Harga: 100000
Dikurangi Uang Muka yang telah diterima: 500000
Dasar Pengenaan Pajak: 2900000
Jumlah PPN (Pajak Pertambahan Nilai): 290000
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah): 0
`;

async function runTests() {
    console.log('=== Testing Improved Faktur Pajak OCR Processing ===\n');

    // Test 1: Process with GenAI (if available)
    console.log('Test 1: Processing with GenAI...');
    try {
        const genaiResult = await fakturPajakLogic.processFakturPajakWithGenAI(sampleFakturPajakText);
        console.log('GenAI Result:', JSON.stringify(genaiResult, null, 2));
    } catch (error) {
        console.log('GenAI not available, using fallback...');
    }

    // Test 2: Process with Fallback
    console.log('\nTest 2: Processing with Fallback...');
    try {
        const fallbackResult = fakturPajakLogic.processFakturPajakWithFallback(sampleFakturPajakText);
        console.log('Fallback Result:', JSON.stringify(fallbackResult, null, 2));
    } catch (error) {
        console.error('Fallback processing error:', error);
    }

    // Test 3: Convert to format
    console.log('\nTest 3: Converting to format...');
    try {
        const mockOcrData = {
            nama: 'PT EFG',
            alamat: 'JAKARTA BARAT 1234567890',
            kodeDanNomorSeriFakturPajak: '00000000000000001',
            dataBeli: {
                nama: 'PT ABC',
                alamat: 'TANGERANG',
                npwp: '1112131415'
            },
            productTable: {
                headers: ['No.', 'Kode Barang/Jasa', 'Nama Barang Kena Pajak/Jasa Kena Pajak', 'Harga Jual/Penggantian/Uang Muka/Termin (Rp)'],
                items: [
                    {
                        no: '1',
                        kodeBarangJasa: 'PROD-001',
                        namaBarangJasa: 'Komponen Elektronik',
                        hargaJual: '1200000'
                    },
                    {
                        no: '2',
                        kodeBarangJasa: 'PROD-002',
                        namaBarangJasa: 'Spare Part',
                        hargaJual: '800000'
                    },
                    {
                        no: '3',
                        kodeBarangJasa: 'PROD-003',
                        namaBarangJasa: 'Material Steel',
                        hargaJual: '1500000'
                    }
                ]
            },
            summaryData: {
                hargaJualPenggantianUangMukaTermin: '3500000',
                dikurangiPotonganHarga: '100000',
                dikurangiUangMukaYangTelahDiterima: '500000',
                dasarPengenaanPajak: '2900000',
                jumlahPPN: '290000',
                jumlahPPnBM: '0'
            }
        };
        
        const formattedData = fakturPajakLogic.convertFakturPajakOCRDataToFormat(mockOcrData, 'test-faktur-pajak.pdf');
        console.log('Formatted Data:', JSON.stringify(formattedData, null, 2));
    } catch (error) {
        console.error('Format conversion error:', error);
    }

    console.log('\n=== Test Complete ===');
}

// Run the tests
runTests().catch(console.error); 