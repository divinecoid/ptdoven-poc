# Troubleshooting Guide

## Error: "formatCurrency is not defined"

### Penyebab
Fungsi `formatCurrency` tidak terdefinisi di file JavaScript.

### Solusi
1. **Tambahkan fungsi formatCurrency di file logic:**
   ```javascript
   function formatCurrency(amount) {
       if (!amount || amount === '' || amount === null || amount === undefined) {
           return 'Rp 0';
       }
       
       // Convert to number if it's a string
       let numAmount = amount;
       if (typeof amount === 'string') {
           // Remove any non-numeric characters except decimal point
           numAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
           if (isNaN(numAmount)) {
               return 'Rp 0';
           }
       }
       
       // Format as Indonesian Rupiah
       return new Intl.NumberFormat('id-ID', {
           style: 'currency',
           currency: 'IDR',
           minimumFractionDigits: 0,
           maximumFractionDigits: 0
       }).format(numAmount);
   }
   ```

2. **Atau gunakan format sederhana:**
   ```javascript
   function formatCurrency(amount) {
       if (!amount || amount === '') return 'Tidak tersedia';
       return new Intl.NumberFormat('id-ID', {
           style: 'currency',
           currency: 'IDR'
       }).format(amount);
   }
   ```

3. **Restart aplikasi:**
   ```bash
   npm start
   ```

## Error: "The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined"

### Penyebab
Data file yang dikirim dari frontend ke main process tidak dalam format yang benar.

### Solusi
1. **Pastikan data file dikirim dengan format yang benar:**
   ```javascript
   // Di frontend (po.js)
   const arrayBuffer = await file.arrayBuffer();
   const fileData = {
       name: file.name,
       data: Array.from(new Uint8Array(arrayBuffer))
   };
   ```

2. **Pastikan main process menerima data dengan benar:**
   ```javascript
   // Di main.js
   if (!fileData || !fileData.name || !fileData.data) {
       throw new Error('Invalid file data received');
   }
   
   const buffer = Buffer.from(fileData.data);
   fs.writeFileSync(tempFilePath, buffer);
   ```

3. **Validasi data file:**
   ```javascript
   function validateFileData(fileData) {
       if (!fileData || !fileData.name || !fileData.data) {
           return false;
       }
       
       if (!Array.isArray(fileData.data) || fileData.data.length === 0) {
           return false;
       }
       
       return true;
   }
   ```

4. **Restart aplikasi:**
   ```bash
   npm start
   ```

## Error: "showMessage is not defined"

### Penyebab
Fungsi `showMessage` tidak terdefinisi di file JavaScript.

### Solusi
1. **Pastikan fungsi showMessage ada di file logic:**
   ```javascript
   function showMessage(message, type = 'info') {
       const snackbar = document.getElementById('snackbar');
       const snackbarIcon = document.getElementById('snackbarIcon');
       const snackbarMessage = document.getElementById('snackbarMessage');
       
       if (!snackbar || !snackbarIcon || !snackbarMessage) {
           alert(message);
           return;
       }
       
       const icons = {
           success: '✅',
           error: '❌',
           warning: '⚠️',
           info: 'ℹ️'
       };
       
       snackbarIcon.textContent = icons[type] || icons.info;
       snackbarMessage.textContent = message;
       snackbar.classList.add('show');
       
       setTimeout(() => {
           snackbar.classList.remove('show');
       }, 3000);
   }
   ```

2. **Pastikan snackbar HTML ada di halaman:**
   ```html
   <div class="snackbar" id="snackbar">
       <div class="snackbar-content">
           <div class="snackbar-icon" id="snackbarIcon">✅</div>
           <div class="snackbar-message" id="snackbarMessage">Message</div>
           <button class="snackbar-close" onclick="closeSnackbar()">&times;</button>
       </div>
   </div>
   ```

3. **Restart aplikasi:**
   ```bash
   npm start
   ```

## Error: "saveToLocalStorage is not defined"

### Penyebab
Fungsi `saveToLocalStorage` tidak terdefinisi.

### Solusi
1. **Tambahkan fungsi saveToLocalStorage:**
   ```javascript
   function saveToLocalStorage(data) {
       try {
           const existingData = JSON.parse(localStorage.getItem('poData') || '[]');
           const newEntry = {
               ...data,
               id: Date.now(),
               timestamp: new Date().toISOString()
           };
           existingData.push(newEntry);
           localStorage.setItem('poData', JSON.stringify(existingData));
       } catch (error) {
           console.error('Error saving to localStorage:', error);
           showMessage('Error menyimpan data ke localStorage', 'error');
       }
   }
   ```

## Error: "GoogleGenAI is not a constructor"

### Penyebab
Import yang salah untuk Google Generative AI.

### Solusi
1. **Pastikan menggunakan package yang benar:**
   ```bash
   npm install @google/genai@1.12.0
   ```

2. **Gunakan import yang benar:**
   ```javascript
   const genaiModule = require('@google/genai');
   const genAI = new genaiModule.GoogleGenAI(apiKey);
   ```

3. **Test import:**
   ```bash
   node test-api.js
   ```

## Error: "Could not load the default credentials"

### Penyebab
API key tidak tersedia atau tidak valid.

### Solusi
1. **Set environment variable:**
   ```bash
   # Windows
   set GOOGLE_API_KEY=your-api-key-here
   
   # Linux/Mac
   export GOOGLE_API_KEY=your-api-key-here
   ```

2. **Atau buat file .env:**
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```

3. **Gunakan fallback processing:**
   - Sistem akan menggunakan pattern matching
   - Tidak memerlukan API key
   - Cocok untuk development

## Error: "genAI.models.generateContent is not a function"

### Penyebab
API method yang salah untuk @google/genai.

### Solusi
1. **Gunakan API yang benar:**
   ```javascript
   const result = await genAI.models.generateContent({
       model: "gemini-1.5-flash",
       contents: [prompt]
   });
   ```

2. **Test API methods:**
   ```bash
   node test-api.js
   ```

## Error: "OCR processing failed"

### Penyebab
Gagal memproses file dengan OCR.

### Solusi
1. **Periksa format file:**
   - PDF: `.pdf`
   - Gambar: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`

2. **Periksa ukuran file:**
   - File tidak terlalu besar
   - Koneksi internet stabil

3. **Cek error log:**
   ```bash
   node test-ocr-simple.js
   ```

## Error: "File not supported"

### Penyebab
Format file tidak didukung.

### Solusi
1. **Gunakan format yang didukung:**
   - PDF files
   - Image files (JPG, PNG, GIF, BMP, WebP)

2. **Convert file jika perlu:**
   - PDF ke gambar
   - Format gambar yang tidak didukung ke JPG/PNG

## Error: "Module not found"

### Penyebab
Dependencies tidak terinstall.

### Solusi
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install package spesifik:**
   ```bash
   npm install @google/genai pdf-parse multer express
   ```

3. **Clear cache dan reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Error: "Permission denied"

### Penyebab
Tidak ada permission untuk mengakses file atau direktori.

### Solusi
1. **Run sebagai administrator (Windows):**
   - Right-click pada terminal
   - "Run as administrator"

2. **Set permission (Linux/Mac):**
   ```bash
   chmod +x node_modules/.bin/*
   ```

3. **Periksa file permissions:**
   ```bash
   ls -la
   ```

## Testing

### Test OCR Functionality
```bash
# Test dengan mock data
node test-ocr-simple.js

# Test dengan file (jika ada)
node test-ocr.js

# Test API methods
node test-api.js
```

### Test Application
```bash
# Run aplikasi
npm start

# Test upload file
# Upload file PDF/gambar di halaman PO Management
```

## Debug Mode

### Enable Debug Logging
```javascript
// Di file ocr.js
console.log('Debug: Processing file:', filePath);
console.log('Debug: Extracted text:', textContent);
console.log('Debug: Parsed data:', parsedData);
```

### Check Console Logs
1. **Electron DevTools:**
   - Press `F12` atau `Ctrl+Shift+I`
   - Check Console tab

2. **Terminal logs:**
   - Check terminal output saat menjalankan aplikasi

## Performance Issues

### Slow Processing
1. **Optimize file size:**
   - Compress images
   - Reduce PDF resolution

2. **Check network:**
   - Stable internet connection
   - VPN jika diperlukan

3. **Use fallback:**
   - Tanpa API key untuk development
   - Pattern matching lebih cepat

### Memory Issues
1. **Restart aplikasi:**
   ```bash
   npm start
   ```

2. **Clear cache:**
   ```bash
   npm cache clean --force
   ```

3. **Check memory usage:**
   - Monitor dengan Task Manager
   - Restart jika memory tinggi

## API Key Management

### Get Google API Key
1. **Kunjungi Google AI Studio:**
   - https://makersuite.google.com/app/apikey

2. **Buat API key baru:**
   - Click "Create API Key"
   - Copy key yang dihasilkan

3. **Set environment variable:**
   ```bash
   set GOOGLE_API_KEY=your-key-here
   ```

### Test API Key
```bash
# Test dengan API key
node test-google-genai.js
```

## Environment Setup

### Windows
```bash
# Set environment variable
set GOOGLE_API_KEY=your-key-here

# Run aplikasi
npm start
```

### Linux/Mac
```bash
# Set environment variable
export GOOGLE_API_KEY=your-key-here

# Run aplikasi
npm start
```

### Permanent Setup
1. **Windows:**
   - System Properties > Environment Variables
   - Add GOOGLE_API_KEY

2. **Linux/Mac:**
   - Edit ~/.bashrc atau ~/.zshrc
   - Add export GOOGLE_API_KEY=your-key-here

## Logs dan Monitoring

### Check Logs
```bash
# Application logs
npm start 2>&1 | tee app.log

# Error logs
node test-ocr.js 2>&1 | tee error.log
```

### Monitor Performance
1. **Processing time:**
   - PDF: 10-20 detik
   - Image: 6-15 detik
   - Fallback: Instant

2. **Memory usage:**
   - Monitor dengan Task Manager
   - Restart jika > 1GB

3. **Network usage:**
   - Monitor bandwidth
   - Check API calls

## Common Solutions

### Reset Application
```bash
# Stop aplikasi
Ctrl+C

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart aplikasi
npm start
```

### Reset Data
```bash
# Clear localStorage
# Di browser console:
localStorage.clear()

# Atau restart aplikasi
npm start
```

### Update Dependencies
```bash
# Update semua dependencies
npm update

# Update package spesifik
npm update @google/genai
```

## Support

### Jika masih ada masalah:
1. **Check error logs**
2. **Test dengan file sederhana**
3. **Gunakan fallback processing**
4. **Restart aplikasi**
5. **Reinstall dependencies**

### Contact:
- Email: support@ptdoven.com
- GitHub: https://github.com/divinecoid/ptdoven-poc/issues 