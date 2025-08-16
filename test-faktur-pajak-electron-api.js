// Test file untuk memverifikasi Faktur Pajak menggunakan Electron API
// Testing the Electron API integration for Faktur Pajak OCR

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
    },
    // Mock Electron API
    electronAPI: {
        uploadAndOCRFakturPajak: async (fileData) => {
            console.log('Mock Electron API called with fileData:', fileData.name);
            return {
                success: true,
                data: {
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
                        items: [{
                            no: '1',
                            kodeBarangJasa: '000000',
                            namaBarangJasa: 'TAS BELANJA',
                            hargaJual: '1000000'
                        }]
                    },
                    summaryData: {
                        hargaJualPenggantianUangMukaTermin: '1000000',
                        dikurangiPotonganHarga: '10000',
                        dasarPengenaanPajak: '907500',
                        jumlahPPN: '108900'
                    }
                },
                originalText: `
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
                `
            };
        }
    }
};

// Import the Faktur Pajak logic
const fakturPajakLogic = require('./src/logic/faktur-pajak.js');

async function testElectronAPI() {
    console.log('=== Testing Faktur Pajak Electron API Integration ===\n');

    // Test 1: Test processFakturPajakWithElectronAPI function
    console.log('Test 1: Testing processFakturPajakWithElectronAPI...');
    try {
        // Create a mock file object
        const mockFile = {
            name: 'test-faktur-pajak.pdf',
            arrayBuffer: async () => new ArrayBuffer(8)
        };

        // Test the Electron API function
        const result = await fakturPajakLogic.processFakturPajakWithElectronAPI(mockFile);
        
        console.log('✅ Electron API test successful!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        // Verify key fields
        console.log('\nVerification:');
        console.log('Supplier Name:', result.supplier);
        console.log('Invoice Number:', result.nomorFaktur);
        console.log('Buyer Name:', result.buyerNama);
        console.log('Total PPN:', result.totalPPN);
        console.log('Items Count:', result.items.length);
        
    } catch (error) {
        console.error('❌ Electron API test failed:', error);
    }

    // Test 2: Test processFakturPajakOCRData with file data
    console.log('\nTest 2: Testing processFakturPajakOCRData with file data...');
    try {
        const mockFile = {
            name: 'test-faktur-pajak.pdf',
            arrayBuffer: async () => new ArrayBuffer(8)
        };

        const result = await fakturPajakLogic.processFakturPajakOCRData('test-faktur-pajak.pdf', mockFile);
        
        console.log('✅ processFakturPajakOCRData test successful!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ processFakturPajakOCRData test failed:', error);
    }

    // Test 3: Test processFakturPajakOCRData without file data (simulation)
    console.log('\nTest 3: Testing processFakturPajakOCRData without file data (simulation)...');
    try {
        const result = await fakturPajakLogic.processFakturPajakOCRData('test-faktur-pajak.pdf', null);
        
        console.log('✅ Simulation test successful!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ Simulation test failed:', error);
    }

    console.log('\n=== Test Completed ===');
}

// Run the tests
testElectronAPI().catch(console.error); 