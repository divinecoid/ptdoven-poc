// Test file untuk memverifikasi perbaikan OCR Faktur Pajak
// Testing the fix for Faktur Pajak OCR yang terus mengembalikan mock data

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

// Sample text yang sesuai dengan gambar Faktur Pajak yang diberikan
const sampleFakturPajakText = `
FAKTUR PAJAK

Nama: PT EFG
Alamat: JAKARTA BARAT
12345678910

Kode dan Nomor Seri Faktur Pajak: 00000000000000001

Pengusaha Kena Pajak:
Nama: PT EFG
Alamat: JAKARTA BARAT
NPWP: 12345678910

Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama: PT ABC
Alamat: TANGERANG
NPWP: 1112131415
NIK: -
Nomor Paspor: -
Identitas Lain: -
Email:

No. Kode Barang/Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1. 000000 TAS BELANJA 1.000.000,00
Rp 1000 x 1.000,00 Piece
Potongan Harga = Rp 10.000
PPnBM (0,00%) = Rp 0,00

Harga Jual / Penggantian / Uang Muka / Termin: 1.000.000,00
Dikurangi Potongan Harga: 10.000,00
Dikurangi Uang Muka yang telah diterima:
Dasar Pengenaan Pajak: 907.500,00
Jumlah PPN (Pajak Pertambahan Nilai): 108.900,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah): 0,00
`;

async function runTests() {
    console.log('=== Testing Fixed Faktur Pajak OCR Processing ===\n');

    // Test 1: Process with GenAI (if available)
    console.log('Test 1: Processing with GenAI...');
    try {
        const genaiResult = await fakturPajakLogic.processFakturPajakWithGenAI(sampleFakturPajakText);
        console.log('GenAI Result:', JSON.stringify(genaiResult, null, 2));
        
        // Verify key fields are extracted correctly
        console.log('\nVerification:');
        console.log('Supplier Name:', genaiResult.nama);
        console.log('Supplier Address:', genaiResult.alamat);
        console.log('Invoice Number:', genaiResult.kodeDanNomorSeriFakturPajak);
        console.log('Buyer Name:', genaiResult.dataBeli?.nama);
        console.log('Buyer NPWP:', genaiResult.dataBeli?.npwp);
        console.log('Product Items Count:', genaiResult.productTable?.items?.length);
        console.log('Total PPN:', genaiResult.summaryData?.jumlahPPN);
        
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

    // Test 3: Test OCR data processing without file (simulation)
    console.log('\nTest 3: Testing OCR data processing (simulation)...');
    try {
        const ocrResult = await fakturPajakLogic.processFakturPajakOCRData('test-faktur-pajak.pdf');
        console.log('OCR Processing Result:', JSON.stringify(ocrResult, null, 2));
    } catch (error) {
        console.error('OCR processing error:', error);
    }

    // Test 4: Convert to format
    console.log('\nTest 4: Converting to format...');
    try {
        const mockOcrData = {
            nama: 'PT EFG',
            alamat: 'JAKARTA BARAT',
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
                        kodeBarangJasa: '000000',
                        namaBarangJasa: 'TAS BELANJA',
                        hargaJual: '1000000'
                    }
                ]
            },
            summaryData: {
                hargaJualPenggantianUangMukaTermin: '1000000',
                dikurangiPotonganHarga: '10000',
                dikurangiUangMukaYangTelahDiterima: '0',
                dasarPengenaanPajak: '907500',
                jumlahPPN: '108900',
                jumlahPPnBM: '0'
            }
        };
        
        const formattedResult = fakturPajakLogic.convertFakturPajakOCRDataToFormat(mockOcrData, 'test-faktur-pajak.pdf');
        console.log('Formatted Result:', JSON.stringify(formattedResult, null, 2));
    } catch (error) {
        console.error('Format conversion error:', error);
    }

    console.log('\n=== Test Completed ===');
}

// Run the tests
runTests().catch(console.error); 