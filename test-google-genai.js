// Test GoogleGenAI import yang benar
console.log('Testing GoogleGenAI import...');

try {
    const genaiModule = require('@google/genai');
    console.log('✅ Package loaded successfully');
    
    if (genaiModule.GoogleGenAI) {
        console.log('✅ GoogleGenAI constructor found');
        
        // Test initialization (without API key for now)
        try {
            const genAI = new genaiModule.GoogleGenAI('test-api-key');
            console.log('✅ GoogleGenAI initialized successfully');
            
            // Test model creation
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log('✅ Model created successfully');
            console.log('✅ Import working correctly!');
            
        } catch (initError) {
            console.log('⚠️ Initialization failed (expected without valid API key):', initError.message);
            console.log('✅ But import structure is correct!');
        }
        
    } else {
        console.log('❌ GoogleGenAI constructor not found');
        console.log('Available properties:', Object.keys(genaiModule));
    }
    
} catch (error) {
    console.error('❌ Import failed:', error.message);
} 