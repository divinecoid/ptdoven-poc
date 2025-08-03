// Test API methods dari @google/genai
console.log('Testing @google/genai API methods...');

try {
    const genaiModule = require('@google/genai');
    console.log('✅ Package loaded successfully');
    
    if (genaiModule.GoogleGenAI) {
        console.log('✅ GoogleGenAI constructor found');
        
        // Test initialization
        try {
            const genAI = new genaiModule.GoogleGenAI('test-api-key');
            console.log('✅ GoogleGenAI initialized');
            
            // Check available methods
            console.log('Available methods on genAI:', Object.getOwnPropertyNames(genAI));
            console.log('genAI type:', typeof genAI);
            
            // Test if getGenerativeModel exists
            if (typeof genAI.getGenerativeModel === 'function') {
                console.log('✅ getGenerativeModel is a function');
                
                // Test model creation
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    console.log('✅ Model created successfully');
                    console.log('Model type:', typeof model);
                    console.log('Model methods:', Object.getOwnPropertyNames(model));
                    
                    // Test if generateContent exists
                    if (typeof model.generateContent === 'function') {
                        console.log('✅ generateContent is a function');
                    } else {
                        console.log('❌ generateContent is not a function');
                    }
                    
                } catch (modelError) {
                    console.log('⚠️ Model creation failed:', modelError.message);
                }
                
            } else {
                console.log('❌ getGenerativeModel is not a function');
                console.log('Available methods:', Object.getOwnPropertyNames(genAI));
            }
            
        } catch (initError) {
            console.log('⚠️ Initialization failed:', initError.message);
        }
        
    } else {
        console.log('❌ GoogleGenAI constructor not found');
        console.log('Available properties:', Object.keys(genaiModule));
    }
    
} catch (error) {
    console.error('❌ Import failed:', error.message);
} 