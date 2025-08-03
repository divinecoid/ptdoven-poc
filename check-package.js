// Check @google/genai package installation
console.log('Checking @google/genai package...');

try {
    // Check if package is installed
    const packagePath = require.resolve('@google/genai');
    console.log('Package found at:', packagePath);
    
    // Try to require the package
    const genai = require('@google/genai');
    console.log('Package loaded successfully');
    console.log('Type:', typeof genai);
    console.log('Keys:', Object.keys(genai));
    
    // Check if it's a function or object
    if (typeof genai === 'function') {
        console.log('Package exports a function');
    } else if (typeof genai === 'object') {
        console.log('Package exports an object');
        console.log('Available methods:', Object.getOwnPropertyNames(genai));
    }
    
} catch (error) {
    console.error('Error loading @google/genai:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Check if package is in node_modules
    try {
        const fs = require('fs');
        const path = require('path');
        const packageJsonPath = path.join(__dirname, 'node_modules', '@google', 'genai', 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
            console.log('Package exists in node_modules');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            console.log('Package version:', packageJson.version);
            console.log('Package main:', packageJson.main);
        } else {
            console.log('Package not found in node_modules');
        }
    } catch (e) {
        console.error('Error checking package files:', e.message);
    }
} 