# Perbaikan Upload Button Bank CSV

## Masalah
Upload button untuk bank CSV tidak membuka file dialog ketika diklik. Masalah ini terjadi karena event listener didefinisikan sebelum elemen DOM tersedia.

## Penyebab
1. **Event Listener Didefinisikan Terlalu Awal**: Event listener untuk upload button didefinisikan di awal file sebelum elemen DOM tersedia
2. **Elemen UI Tidak Ditemukan**: Semua elemen UI dideklarasikan sebagai `const` di awal file, tetapi elemen belum ada saat script dijalankan
3. **Timing Issue**: Script dijalankan sebelum DOM selesai dimuat

## Solusi yang Diterapkan

### 1. Menambahkan onclick Attribute di HTML
- Menambahkan `onclick="openUploadDialog()"` ke upload button di `bank.html`
- Menggunakan event listener di JavaScript untuk upload area click (mengikuti pola PO)
- Mengikuti pola yang sama dengan halaman lain yang bekerja dengan baik

### 2. Membuat Fungsi Global
- Menambahkan fungsi global `openUploadDialog()` di `bank.js`
- Menambahkan fungsi global `closeUploadDialog()` di `bank.js`
- Menambahkan fungsi global `uploadFiles()` di `bank.js`
- Menambahkan fungsi global `closeDetailModal()` di `bank.js`
- Menambahkan fungsi global `updateMutasiStatus()` di `bank.js`
- Menambahkan fungsi global `triggerFileInput()` di `bank.js`

### 3. Menambahkan Error Handling dan Logging
- Menambahkan console.log untuk debugging
- Menambahkan null check untuk setiap elemen
- Menambahkan error handling untuk mencegah crash

## Perubahan Kode

### Sebelum:
```html
<button class="upload-btn" id="uploadBtn"><span>📤</span>Upload CSV Bank</button>
<div class="upload-area" id="uploadArea">
    <div class="upload-icon">📄</div>
    <div class="upload-text">Click to select or drag files here</div>
    <div class="upload-hint">Supports CSV files only</div>
    <input type="file" class="file-input" id="fileInput" accept=".csv" multiple>
</div>
```

### Sesudah:
```html
<button class="upload-btn" id="uploadBtn" onclick="openUploadDialog()"><span>📤</span>Upload CSV Bank</button>
<div class="upload-area" id="uploadArea">
    <div class="upload-icon">📄</div>
    <div class="upload-text">Click to select or drag files here</div>
    <div class="upload-hint">Supports CSV files only</div>
    <input type="file" class="file-input" id="fileInput" accept=".csv" multiple>
</div>
```

**Event Listener di JavaScript:**
```javascript
// Click to select files
uploadArea.addEventListener('click', (e) => {
    console.log('🖱️ Upload area clicked');
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 File input element:', fileInput);
    if (fileInput) {
        console.log('📋 File input properties:', {
            type: fileInput.type,
            accept: fileInput.accept,
            multiple: fileInput.multiple,
            disabled: fileInput.disabled,
            style: fileInput.style.display
        });
        try {
            console.log('🚀 Attempting to click file input...');
            fileInput.click();
            console.log('✅ File input clicked successfully');
        } catch (error) {
            console.error('❌ Error clicking file input:', error);
        }
    } else {
        console.error('❌ File input not found');
    }
});
```

### Fungsi Global yang Ditambahkan:
```javascript
// Global function for onclick handler
function openUploadDialog() {
    console.log('Global openUploadDialog() called');
    const uploadDialog = document.getElementById('uploadDialog');
    if (uploadDialog) {
        uploadDialog.classList.add('active');
        selectedFiles = [];
        updateUploadButton();
        updateUploadArea();
        console.log('✅ Upload dialog opened successfully');
    } else {
        console.error('❌ Upload dialog element not found');
    }
}

// Global function for onclick handler
function triggerFileInput() {
    console.log('Global triggerFileInput() called');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        console.log('File input element found, clicking...');
        try {
            fileInput.click();
            console.log('✅ File input clicked successfully');
        } catch (error) {
            console.error('❌ Error clicking file input:', error);
        }
    } else {
        console.error('❌ File input element not found');
    }
}
```

## File yang Dimodifikasi

1. `src/page/bank.html`
   - Menambahkan `onclick="openUploadDialog()"` ke upload button

2. `src/logic/bank.js`
   - Menambahkan fungsi global `openUploadDialog()`
   - Menambahkan fungsi global `closeUploadDialog()`
   - Menambahkan fungsi global `uploadFiles()`
   - Menambahkan fungsi global `closeDetailModal()`
   - Menambahkan fungsi global `updateMutasiStatus()`
   - Memperbaiki event listener untuk upload area click
   - Menambahkan console.log untuk debugging
   - Menambahkan null check dan error handling

## Testing
- Upload button sekarang akan membuka file dialog ketika diklik
- Console browser akan menampilkan log untuk debugging
- Semua event listener akan terpasang dengan benar setelah DOM dimuat

## Troubleshooting

### Jika upload button masih tidak bekerja:
1. **Periksa Console Browser**: Buka Developer Tools dan lihat apakah ada error
2. **Periksa Log**: Console akan menampilkan log seperti "Upload button element found" atau "Upload button element not found"
3. **Refresh Halaman**: Pastikan halaman di-refresh untuk memuat script yang sudah diperbaiki

### Log yang Diharapkan:
```
🚀 Global openUploadDialog() called
🔍 Looking for element with id: uploadDialog
📂 Opening upload dialog (active)
✅ Upload dialog opened successfully
```

**Untuk Upload Area Click:**
```
✅ Upload area found, setting up event listeners
✅ Upload area event listeners set up successfully
🖱️ Upload area clicked
🔍 File input element: [object HTMLInputElement]
📋 File input properties: {type: "file", accept: ".csv", multiple: true, disabled: false, style: "display: none"}
🚀 Attempting to click file input...
✅ File input clicked successfully
```

## Catatan
- Perbaikan ini mengikuti pola yang sama dengan file invoices yang sudah bekerja dengan baik
- Menggunakan onclick attribute di HTML untuk event handling
- Fungsi global ditambahkan untuk mendukung onclick attribute
- Error handling ditambahkan untuk mencegah crash jika elemen tidak ditemukan 