const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // OCR Processing
    processOCR: (filePath) => ipcRenderer.invoke('process-ocr', filePath),
    uploadAndOCR: (fileData) => ipcRenderer.invoke('upload-and-ocr', fileData),
    uploadAndOCRFakturPajak: (fileData) => ipcRenderer.invoke('upload-and-ocr-faktur-pajak', fileData),
    
    // File handling
    selectFile: () => ipcRenderer.invoke('select-file'),
    
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // Window controls
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    
    // IPC communication
    send: (channel, data) => {
        // Whitelist channels
        const validChannels = ['ocr-request', 'file-upload', 'app-action'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    
    receive: (channel, func) => {
        const validChannels = ['ocr-result', 'file-result', 'app-response'];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

// Security: Remove nodeIntegration and enable contextIsolation
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
}); 