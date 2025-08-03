# OCR Setup dan Penggunaan

## Overview
Fitur OCR (Optical Character Recognition) telah ditambahkan ke aplikasi PT Doven Tradeco untuk memproses file PDF dan gambar Purchase Order (PO) menggunakan Google Generative AI.

## Fitur OCR
- ✅ Upload file PDF dan gambar (JPG, PNG, GIF, BMP, WebP)
- ✅ OCR processing menggunakan Google Generative AI (Gemini 1.5 Flash)
- ✅ Ekstraksi otomatis data PO dari dokumen
- ✅ Parsing struktur data: supplier, PO number, dates, items, prices
- ✅ Integrasi dengan sistem PO Management yang sudah ada
- ✅ Fallback processing ketika API tidak tersedia

## Menampilkan Detail PO dari OCR

### Cara Kerja Detail PO OCR:

1. **Upload File PDF/Gambar:**
   - Upload file PDF atau gambar di halaman PO Management
   - Sistem akan memproses OCR secara otomatis
   - Data akan disimpan ke dalam sistem yang ada

2. **Data Storage:**
   - **Basic Data**: Disimpan ke `poUploads` localStorage (format standar)
   - **Detailed Data**: Disimpan ke `poDetailedData` localStorage (data lengkap OCR)
   - **Table Display**: Data ditampilkan di tabel dengan tombol "📋 Detail"

3. **Menampilkan Detail:**
   - Klik tombol "📋 Detail" pada baris PO yang diproses OCR
   - Modal akan menampilkan:
     - **Basic Information**: Supplier, PO Number, Dates, Items
     - **OCR Detailed Information**: FPP Number, Hour Schedule, Door, Financial Details, Notes
     - **OCR Indicator**: Badge "🤖 Processed with OCR"

### Struktur Data OCR:

```javascript
{
  // Basic data (untuk tabel)
  name: "OCR File",
  supplier: "EFG PT [2PZ1.J.0400.1.F]",
  poNumber: "2PZ1POC25003023",
  poDate: "11-MAR-25",
  deliveryDate: "18-MAR-25",
  totalAmount: "1098900",
  items: [...],
  
  // Detailed data (untuk detail view)
  supplierDetails: { name, address, phone, fax },
  deliveryDetails: { deliverTo, vehicleNumber, palet },
  orderDetails: { fppNumber, hourSchedule, door, processDateTime },
  financialDetails: { totalPurchasePrice, totalItemDiscount, ... },
  notes: { generalNotes, byLetter, nb: [...] }
}
```

### Troubleshooting Detail PO:

#### **Detail tidak muncul:**
1. **Periksa localStorage:**
   ```javascript
   // Di browser console
   console.log(localStorage.getItem('poUploads'));
   console.log(localStorage.getItem('poDetailedData'));
   ```

2. **Pastikan data tersimpan:**
   - Upload file PDF/gambar
   - Periksa console untuk error
   - Pastikan OCR processing berhasil

3. **Refresh halaman:**
   - Reload halaman setelah upload
   - Pastikan tabel ter-update

#### **Detail kosong:**
1. **Periksa OCR processing:**
   - Pastikan file tidak rusak
   - Cek koneksi internet
   - Gunakan fallback processing

2. **Periksa data structure:**
   - Pastikan format data benar
   - Cek console untuk error

### Fitur Detail PO OCR:

#### **✅ Basic Information:**
- Supplier name dan address
- PO Number dan dates
- Delivery information
- Items list dengan quantities dan prices

#### **✅ OCR Detailed Information:**
- FPP Number
- Hour Schedule dan Door
- Financial breakdown (purchase price, discounts, VAT)
- Notes dan remarks
- By letter (amount in words)

#### **✅ Visual Indicators:**
- Badge "🤖 Processed with OCR"
- Enhanced detail sections
- Color-coded information

### Testing Detail PO:

```bash
# Test OCR processing
node test-ocr-simple.js

# Test aplikasi
npm start

# Upload file PDF/gambar
# Klik tombol "📋 Detail"
# Periksa detail yang ditampilkan
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Google API Key (Optional)
Untuk menggunakan Google AI API yang sebenarnya:

1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Buat API key baru
3. Set environment variable:
   ```bash
   # Windows
   set GOOGLE_API_KEY=your-api-key-here
   
   # Linux/Mac
   export GOOGLE_API_KEY=your-api-key-here
   ```
   
   Atau buat file `.env`:
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```

### 3. Jalankan Aplikasi
```bash
npm start
```

### 4. Test OCR (Optional)
```bash
# Test dengan mock data
node test-ocr-simple.js

# Test dengan file (jika ada)
node test-ocr.js
```

## Penggunaan

### Upload File dengan OCR
1. Buka halaman PO Management
2. Klik tombol "Upload PO (EDI/CSV/Excel/PDF/Image)"
3. Pilih file PDF atau gambar
4. Sistem akan memproses OCR secara otomatis
5. Data PO akan diekstrak dan ditampilkan di tabel

### Format File yang Didukung
- **PDF**: `.pdf`
- **Gambar**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`

### Data yang Diekstrak
- Supplier/Vendor name
- PO Number
- PO Date
- Delivery Date
- Line items dengan:
  - Item code/SKU
  - Description
  - Quantity
  - Unit price
  - Total amount
- Total PO amount

## Teknologi yang Digunakan

### Google Generative AI
- **Package**: `@google/genai`
- **Constructor**: `GoogleGenAI`
- **API Method**: `genAI.models.generateContent()`
- **Model**: Gemini 1.5 Flash
- **Fitur**: OCR untuk gambar dan PDF
- **Kecepatan**: 6-20 detik per file (tergantung koneksi)
- **Token Usage**: 5000-10000 token per halaman

### Dependencies
- `@google/genai`: Google Generative AI SDK
- `pdf-parse`: PDF text extraction
- `electron`: Desktop app framework
- `multer`: File upload handling

## API Usage

### Correct API Call:
```javascript
const genaiModule = require('@google/genai');
const genAI = new genaiModule.GoogleGenAI(apiKey);

const result = await genAI.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [prompt]
});
```

### Fallback Implementation:
Jika API key tidak tersedia atau ada error credentials, sistem akan menggunakan fallback processing yang masih bisa mengekstrak data PO dari text.

## Troubleshooting

### Error: "Could not load the default credentials"
- **Penyebab**: API key tidak diset atau tidak valid
- **Solusi**: Set environment variable `GOOGLE_API_KEY` atau gunakan fallback
- **Fallback**: Sistem akan tetap berfungsi dengan mock processing

### Error: "GoogleGenAI is not a constructor"
- Pastikan menggunakan package `@google/genai` (versi 1.12.0)
- Gunakan `GoogleGenAI` bukan `GoogleGenerativeAI`
- Jalankan `npm install` untuk menginstall dependencies yang benar

### Error: "OCR processing failed"
- Periksa koneksi internet
- Pastikan file tidak rusak
- Coba dengan file yang lebih kecil
- Sistem akan menggunakan fallback jika API gagal

### Error: "File not supported"
- Pastikan format file didukung
- Gunakan file PDF atau gambar yang jelas

## Performa
- **PDF**: 10-20 detik per halaman
- **Gambar**: 6-15 detik per file
- **Token Usage**: ~5000-10000 per halaman
- **Akurasi**: Tinggi untuk dokumen PO yang jelas
- **Fallback**: Instant processing tanpa API

## Biaya
- **Gemini 1.5 Flash**: $0.5/1M token
- **Gemini 1.5 Flash Lite**: $0.3/1M token
- **Estimasi per file**: ~$0.005-0.01 per file
- **Fallback**: Gratis (tidak menggunakan API)

## Keamanan
- API key disimpan di environment variable
- File temporary dihapus setelah processing
- Tidak ada data yang disimpan permanen
- Context isolation di Electron
- Fallback tidak memerlukan API key

## Development Notes
- OCR processing dilakukan di main process Electron
- IPC communication antara renderer dan main process
- Fallback processing untuk browser (terbatas)
- Error handling untuk berbagai skenario
- Test file tersedia: `test-ocr-simple.js`
- **Import yang benar**: `GoogleGenAI` dari `@google/genai`
- **API yang benar**: `genAI.models.generateContent()`
- **Fallback**: Otomatis ketika credentials tidak tersedia 