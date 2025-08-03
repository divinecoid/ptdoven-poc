// Test file upload data format
console.log('Testing file upload data format...');

// Simulate file data that would be sent from frontend
const mockFileData = {
    name: 'test.pdf',
    data: [80, 68, 70, 45, 49, 46, 48, 46, 49, 10] // PDF header bytes
};

console.log('Mock file data:', JSON.stringify(mockFileData, null, 2));
console.log('File name:', mockFileData.name);
console.log('File data type:', typeof mockFileData.data);
console.log('File data length:', mockFileData.data.length);
console.log('Is array:', Array.isArray(mockFileData.data));

// Test Buffer conversion
try {
    const buffer = Buffer.from(mockFileData.data);
    console.log('Buffer created successfully');
    console.log('Buffer length:', buffer.length);
    console.log('Buffer as string:', buffer.toString('utf8', 0, 10));
} catch (error) {
    console.error('Buffer creation failed:', error.message);
}

// Test file validation
function validateFileData(fileData) {
    if (!fileData) {
        return 'File data is null or undefined';
    }
    
    if (!fileData.name) {
        return 'File name is missing';
    }
    
    if (!fileData.data) {
        return 'File data is missing';
    }
    
    if (!Array.isArray(fileData.data)) {
        return 'File data is not an array';
    }
    
    if (fileData.data.length === 0) {
        return 'File data is empty';
    }
    
    return 'File data is valid';
}

console.log('\nValidation result:', validateFileData(mockFileData)); 