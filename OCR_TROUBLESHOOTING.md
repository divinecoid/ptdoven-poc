# OCR Troubleshooting - @google/genai Issues

## Error: "GoogleGenAI is not a constructor"

### Penyebab
Package `@google/genai` tidak terinstall dengan benar atau versi yang tidak kompatibel.

### Solusi

#### 1. Periksa Package Installation
```bash
# Periksa apakah package terinstall
npm list @google/genai

# Periksa versi
npm list @google/genai --depth=0
```

#### 2. Reinstall Package
```bash
# Hapus package
npm uninstall @google/genai

# Install ulang
npm install @google/genai@latest

# Atau install versi spesifik
npm install @google/genai@1.12.0
```

#### 3. Periksa Node.js Version
```bash
# Periksa versi Node.js
node --version

# Periksa versi npm
npm --version
```

#### 4. Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

### Correct Import Method

#### ✅ Import yang Benar:
```javascript
const genaiModule = require('@google/genai');
const genAI = new genaiModule.GoogleGenAI(process.env.GOOGLE_API_KEY);
```

#### ❌ Import yang Salah:
```javascript
// Jangan gunakan ini
const { GoogleGenerativeAI } = require('@google/genai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
```

### Alternative Solutions

#### 1. Gunakan Package yang Berbeda
Jika `@google/genai` bermasalah, coba package alternatif:

```bash
# Install @google/generative-ai sebagai alternatif
npm install @google/generative-ai

# Update import di src/logic/ocr.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
```

#### 2. Gunakan Mock Implementation
Untuk testing tanpa API key:

```javascript
// Di src/logic/ocr.js
let genAI = {
    getGenerativeModel: (config) => ({
        generateContent: async (content) => ({
            response: {
                text: () => JSON.stringify({
                    supplier: 'Mock Supplier',
                    poNumber: 'MOCK-PO-001',
                    items: []
                })
            }
        })
    })
};
```

#### 3. Check Package Structure
```bash
# Periksa struktur package
ls node_modules/@google/genai/

# Periksa package.json
cat node_modules/@google/genai/package.json
```

### Debug Steps

#### 1. Test Import
```javascript
// test-google-genai.js
try {
    const genaiModule = require('@google/genai');
    console.log('Module loaded:', typeof genaiModule);
    console.log('GoogleGenAI available:', !!genaiModule.GoogleGenAI);
} catch (error) {
    console.error('Import failed:', error.message);
}
```

#### 2. Check Environment
```bash
# Periksa environment variables
echo $GOOGLE_API_KEY

# Periksa Node.js environment
node -e "console.log(process.env.GOOGLE_API_KEY)"
```

#### 3. Test with Different Node.js Version
```bash
# Install nvm (Node Version Manager)
# Coba dengan Node.js versi yang berbeda
nvm use 18
npm install
```

### Common Issues

#### 1. Package Not Found
```bash
# Error: Cannot find module '@google/genai'
npm install @google/genai
```

#### 2. Version Mismatch
```bash
# Periksa versi yang terinstall
npm list @google/genai

# Install versi yang benar
npm install @google/genai@1.12.0
```

#### 3. Import Error
```javascript
// ✅ Cara yang benar
const genaiModule = require('@google/genai');
const genAI = new genaiModule.GoogleGenAI(apiKey);

// ❌ Cara yang salah
const { GoogleGenerativeAI } = require('@google/genai');
```

### Workaround

Jika semua solusi di atas tidak berhasil, gunakan fallback implementation:

```javascript
// Di src/logic/ocr.js
let genAI;
try {
    const genaiModule = require('@google/genai');
    genAI = new genaiModule.GoogleGenAI(process.env.GOOGLE_API_KEY);
} catch (error) {
    console.log('Using fallback implementation');
    genAI = {
        getGenerativeModel: () => ({
            generateContent: async () => ({
                response: { text: () => 'Mock response' }
            })
        })
    };
}
```

### Testing

#### 1. Test Package Installation
```bash
node test-google-genai.js
```

#### 2. Test OCR Functionality
```bash
node test-ocr.js
```

#### 3. Test Application
```bash
npm start
```

### Support

Jika masih mengalami masalah:
1. Periksa [Google AI Documentation](https://ai.google.dev/docs)
2. Periksa [@google/genai npm page](https://www.npmjs.com/package/@google/genai)
3. Coba dengan package alternatif `@google/generative-ai`
4. Gunakan mock implementation untuk development 