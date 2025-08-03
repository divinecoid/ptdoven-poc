const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { processPOWithOCR } = require('./logic/ocr');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png'), // Optional: add your app icon
        title: 'PT Doven Tradeco - Business Dashboard'
    });

    // Load the index.html file
    mainWindow.loadFile(path.join(__dirname, 'page/index.html'));

    // Open DevTools in development (comment out for production)
    // mainWindow.webContents.openDevTools();

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC Handler for OCR Processing
ipcMain.handle('process-ocr', async (event, filePath) => {
    try {
        console.log('Received OCR request for:', filePath);
        
        // Validate file path
        if (!filePath || !fs.existsSync(filePath)) {
            throw new Error('File not found or invalid path');
        }
        
        // Process OCR
        const result = await processPOWithOCR(filePath);
        
        console.log('OCR processing completed successfully');
        return {
            success: true,
            data: result.data,
            originalText: result.originalText
        };
        
    } catch (error) {
        console.error('OCR processing error:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
});

// IPC Handler for file upload and OCR
ipcMain.handle('upload-and-ocr', async (event, fileData) => {
    try {
        console.log('Received file upload for OCR processing');
        
        // Validate file data
        if (!fileData || !fileData.name || !fileData.data) {
            throw new Error('Invalid file data received');
        }
        
        // Create temporary file
        const tempDir = path.join(app.getPath('temp'), 'ptdoven-ocr');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${fileData.name}`);
        
        // Write file data to temp file
        const buffer = Buffer.from(fileData.data);
        fs.writeFileSync(tempFilePath, buffer);
        
        console.log('Temporary file created:', tempFilePath);
        
        // Process OCR
        const result = await processPOWithOCR(tempFilePath);
        
        // Clean up temp file
        try {
            fs.unlinkSync(tempFilePath);
            console.log('Temporary file cleaned up');
        } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
        }
        
        return {
            success: true,
            data: result.data,
            originalText: result.originalText
        };
        
    } catch (error) {
        console.error('OCR processing error:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});
