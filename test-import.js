// Test import untuk @google/genai
console.log('Testing @google/genai import...');

try {
    // Coba berbagai cara import
    console.log('Trying different import methods...');
    
    // Method 1: Default import
    try {
        const genai = require('@google/genai');
        console.log('Method 1 - Default import:', typeof genai);
        console.log('Available properties:', Object.keys(genai));
    } catch (e) {
        console.log('Method 1 failed:', e.message);
    }
    
    // Method 2: Named import
    try {
        const { GoogleGenerativeAI } = require('@google/genai');
        console.log('Method 2 - Named import:', typeof GoogleGenerativeAI);
    } catch (e) {
        console.log('Method 2 failed:', e.message);
    }
    
    // Method 3: Check package info
    try {
        const packageInfo = require('@google/genai/package.json');
        console.log('Package info:', packageInfo);
    } catch (e) {
        console.log('Package info failed:', e.message);
    }
    
} catch (error) {
    console.error('Import test failed:', error.message);
} 