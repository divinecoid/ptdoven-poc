# PT Doven Tradeco Business Dashboard

Aplikasi desktop untuk manajemen bisnis PT Doven Tradeco dengan fitur OCR untuk ekstraksi data Purchase Order dari file PDF dan gambar.

## Fitur Utama

### 📊 Dashboard
- Overview bisnis dengan metrik utama
- Grafik dan statistik real-time
- Monitoring performa bisnis

### 🛒 Purchase Order Management
- **Upload file PO**: EDI, CSV, Excel, PDF, dan gambar
- **OCR Processing**: Ekstraksi otomatis data dari PDF dan gambar
- **Structured Data**: Supplier, FPP Number, dates, items, financial details
- **Detail View**: Halaman detail lengkap untuk setiap PO
- **Data Management**: Edit, delete, dan export data

### 📦 LPB (Laporan Penerimaan Barang)
- **Upload file LPB**: PDF dan gambar
- **OCR Processing**: Ekstraksi otomatis data dari PDF dan gambar
- **Structured Data**: Supplier, LPB Number, PO Reference, received items
- **Detail View**: Halaman detail lengkap untuk setiap LPB
- **Data Management**: Edit, delete, dan export data

### 🧾 Faktur Pajak
- **Upload file Faktur Pajak**: PDF dan gambar
- **OCR Processing**: Ekstraksi otomatis data dari PDF dan gambar
- **Structured Data**: Supplier, NPWP, Faktur Number, items, PPN
- **Detail View**: Halaman detail lengkap untuk setiap Faktur Pajak
- **Data Management**: Edit, delete, dan export data

### 🔄 Tanda Tukar Faktur
- **Upload file TTF**: PDF dan gambar
- **OCR Processing**: Ekstraksi otomatis data dari PDF dan gambar
- **Structured Data**: Supplier, TTF Number, Faktur Reference, exchange items
- **Detail View**: Halaman detail lengkap untuk setiap Tanda Tukar Faktur
- **Data Management**: Edit, delete, dan export data

### 💰 Invoice Management
- Manajemen invoice dan pembayaran
- Tracking status pembayaran
- Laporan keuangan

### 🏦 Bank Management
- Monitoring rekening bank
- Transaksi dan saldo
- Laporan bank

## Fitur OCR yang Baru Ditambahkan

### 🔍 OCR Processing
- **File Support**: PDF, JPG, PNG, GIF, BMP, WebP
- **Google AI**: Menggunakan Gemini 1.5 Flash untuk OCR
- **Structured Extraction**: 
  - Supplier information (name, address, phone, fax)
  - Delivery details (deliver to, vehicle number, palet)
  - Order information (FPP number, dates, schedule, door)
  - Product table (name, quantities, prices, discounts)
  - Financial summary (totals, discounts, VAT, bonuses)
  - Notes and remarks (general notes, by letter, NB)

### 📋 Detail View
- **Comprehensive Display**: Semua data yang diekstrak
- **Organized Sections**: Supplier, delivery, order, financial, items, notes
- **Responsive Design**: Mobile-friendly interface
- **Currency Formatting**: Proper Indonesian Rupiah formatting

### 🔧 Technical Features
- **Fallback Processing**: Berfungsi tanpa API key
- **Error Handling**: Graceful error handling
- **Performance**: Fast processing dengan caching
- **Security**: Secure file handling dan data processing

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Google API Key (Optional)
Untuk OCR yang optimal:
```bash
# Windows
set GOOGLE_API_KEY=your-api-key-here

# Linux/Mac
export GOOGLE_API_KEY=your-api-key-here
```

### 3. Run Application
```bash
npm start
```

### 4. Test OCR
```bash
# Test PO OCR functionality
node test-ocr-simple.js

# Test LPB OCR functionality
node test-lpb.js

# Test Faktur Pajak OCR functionality
node test-faktur-pajak.js

# Test Tanda Tukar Faktur OCR functionality
node test-tanda-tukar-faktur.js
```

## Penggunaan

### Upload File PO
1. Buka halaman PO Management
2. Klik "Upload PO (EDI/CSV/Excel/PDF/Image)"
3. Pilih file PDF atau gambar
4. Sistem akan memproses OCR secara otomatis
5. Data akan ditampilkan di tabel

### Lihat Detail PO
1. Setelah upload, klik tombol "Lihat Detail"
2. Halaman detail akan menampilkan semua informasi yang diekstrak
3. Data terorganisir dalam section: Supplier, Delivery, Order, Financial, Items, Notes

## Teknologi

- **Electron**: Desktop application framework
- **Google Generative AI**: OCR processing dengan Gemini 1.5 Flash
- **PDF Processing**: pdf-parse untuk ekstraksi text
- **Image Processing**: Google AI Vision untuk gambar
- **Fallback System**: Pattern matching untuk development

## Struktur Data PO

### Supplier Information
- Name, Address, Phone, Fax

### Delivery Information  
- Deliver To, Vehicle Number, Palet

### Order Information
- FPP Number, Order Date, Delivery Date, Hour Schedule, Door, Process DateTime

### Product Table
- Product Name, Q_Crt, MIN_REC Q_PCS, PLU Price, CONT(C) POT A, KET NETT, LST, Total, PLUB, QTYB, COSTB, POTB

### Financial Summary
- Invoice Disc, Total Purchase Price, Total Item Discount, Total Invoice Discount, Total After Discount, Total Bonus, Total LST, Total VAT Input, Total Include VAT, Total Invoice

### Notes
- General Notes, By Letter, NB (numbered remarks)

## Dependencies

```json
{
  "@google/genai": "^1.12.0",
  "electron": "^37.2.4",
  "pdf-parse": "^1.1.1",
  "multer": "^1.4.5-lts.1",
  "express": "^4.18.2"
}
```

## Development

### File Structure
```
src/
├── logic/
│   ├── ocr.js          # OCR processing logic
│   ├── po.js           # PO management
│   └── ...
├── page/
│   ├── po.html         # PO management page
│   ├── po-detail.html  # PO detail page
│   └── ...
└── main.js             # Electron main process
```

### Testing
```bash
# Test OCR functionality
node test-ocr-simple.js

# Test API methods
node test-api.js

# Run application
npm start
```

## Troubleshooting

### OCR Issues
- **Credentials Error**: Gunakan fallback processing
- **File Not Supported**: Pastikan format file didukung
- **Processing Failed**: Cek koneksi internet dan file integrity

### API Issues  
- **GoogleGenAI Error**: Pastikan package @google/genai terinstall
- **Model Error**: Cek API key dan koneksi
- **Fallback**: Sistem akan menggunakan pattern matching

## Performance

- **PDF Processing**: 10-20 detik per halaman
- **Image Processing**: 6-15 detik per file
- **Fallback Processing**: Instant (tanpa API)
- **Memory Usage**: Optimized untuk file besar

## Security

- **File Handling**: Temporary files dihapus setelah processing
- **API Security**: Environment variables untuk API keys
- **Data Privacy**: Tidak ada data yang disimpan permanen
- **Context Isolation**: Electron security best practices

## License

ISC License - PT Doven Tradeco
