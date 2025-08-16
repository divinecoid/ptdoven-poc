# Faktur Pajak OCR System Documentation

## Overview

The Faktur Pajak OCR system has been enhanced to accurately process tax invoice documents from PDF files. The system uses Google Generative AI (Gemini 1.5 Flash) for intelligent text extraction and includes a robust fallback mechanism for reliable data processing.

## Key Features

### 🔍 Enhanced OCR Processing
- **Google Generative AI Integration**: Uses Gemini 1.5 Flash for intelligent text extraction
- **Robust Fallback System**: Manual parsing when AI is unavailable
- **Multiple Document Formats**: Supports various Faktur Pajak layouts
- **No Hardcoded Data**: All data is extracted from actual document content

### 📋 Data Extraction Capabilities
- **Supplier Information**: Name, address, phone number
- **Invoice Details**: Nomor Faktur, tanggal, NPWP
- **Item Details**: Item codes, descriptions, quantities, prices, PPN
- **Summary Data**: Total amounts, PPN totals, grand totals
- **Additional Notes**: Payment terms, additional information

### 🛡️ Error Handling & Validation
- **Graceful Degradation**: Falls back to manual parsing if AI fails
- **Data Validation**: Ensures numeric values are properly formatted
- **Missing Data Handling**: Generates appropriate defaults for missing fields
- **Currency Formatting**: Proper Indonesian currency formatting with digit grouping

## Technical Architecture

### Core Functions

#### 1. `processFakturPajakWithGenAI(textContent)`
- **Purpose**: Primary OCR processing using Google Generative AI
- **Input**: Extracted text content from PDF
- **Output**: Structured JSON data with all Faktur Pajak information
- **Features**:
  - Comprehensive prompt engineering for accurate extraction
  - Multiple field pattern recognition
  - JSON response parsing with error handling

#### 2. `processFakturPajakWithFallback(textContent)`
- **Purpose**: Manual parsing when AI is unavailable
- **Input**: Extracted text content from PDF
- **Output**: Structured data using regex and string matching
- **Features**:
  - Multiple pattern recognition for different document formats
  - Enhanced item parsing with alternative methods
  - Robust error handling

#### 3. `parseFakturPajakItemFromText(line)`
- **Purpose**: Parse individual item lines from document
- **Input**: Single line of text containing item information
- **Output**: Structured item object
- **Features**:
  - Handles various item line formats
  - Extracts item codes, descriptions, quantities, prices
  - Supports different units (pcs, kg, liter, etc.)

#### 4. `parseFakturPajakItemAlternativeFromText(line)`
- **Purpose**: Alternative parsing method for complex item lines
- **Input**: Single line of text containing item information
- **Output**: Structured item object
- **Features**:
  - Handles unstructured item data
  - Intelligent field separation
  - Fallback for primary parsing failures

### Data Structure

#### OCR Response Format
```json
{
  "supplier": {
    "name": "exact supplier name",
    "address": "exact address if present",
    "phone": "phone number if present"
  },
  "invoice": {
    "nomorFaktur": "exact invoice number",
    "tanggal": "exact date",
    "npwp": "exact NPWP number",
    "totalPPN": "total PPN amount (numeric only)"
  },
  "items": [
    {
      "itemCode": "exact item code/SKU",
      "description": "exact item description",
      "quantity": "quantity (numeric only)",
      "unitPrice": "unit price (numeric only)",
      "total": "total amount (numeric only)",
      "ppn": "PPN amount (numeric only)",
      "unit": "unit of measurement"
    }
  ],
  "summary": {
    "totalAmount": "total invoice amount (numeric only)",
    "totalPPN": "total PPN amount (numeric only)",
    "grandTotal": "grand total including PPN (numeric only)"
  },
  "notes": {
    "paymentTerms": "payment terms if present",
    "additionalInfo": "any additional information"
  }
}
```

#### Application Data Format
```json
{
  "fileId": "unique file identifier",
  "fileName": "original file name",
  "uploadDate": "ISO timestamp",
  "supplier": "supplier name",
  "nomorFaktur": "invoice number",
  "npwp": "NPWP number",
  "totalPPN": "formatted total PPN",
  "status": "draft/confirmed/rejected",
  "items": [
    {
      "itemCode": "item code",
      "description": "item description",
      "quantity": "numeric quantity",
      "unitPrice": "numeric unit price",
      "total": "numeric total",
      "ppn": "numeric PPN",
      "unit": "unit of measurement",
      "status": "item status"
    }
  ]
}
```

## Supported Document Formats

### 1. Standard Faktur Pajak Format
```
PT SUPPLIER ABC
Jl. Contoh No. 123, Jakarta
NPWP: 12.345.678.9-123.000

FAKTUR PAJAK
Nomor Faktur: FP-2024-001
Tanggal: 15 Januari 2024

1. ITEM-001 Bahan Baku A 100 pcs 50000 5000000 500000
2. ITEM-002 Bahan Baku B 50 pcs 75000 3750000 375000

Total: 8750000
PPN: 875000
Grand Total: 9625000
```

### 2. Invoice Format
```
CV VENDOR XYZ
Alamat: Jl. Vendor No. 456, Bandung
NPWP: 98.765.432.1-987.000

INVOICE
Invoice Number: INV-2024-002
Date: 20 Januari 2024

#1 PRODUCT-A Komponen Elektronik 25 pcs 120000 3000000 300000
#2 PRODUCT-B Spare Part 75 pcs 80000 6000000 600000

Total Amount: 9000000
Total PPN: 900000
Grand Total: 9900000
```

### 3. No. Faktur Format
```
PT TRADING COMPANY
Jl. Trading No. 789, Surabaya
Tax ID: 11.222.333.4-111.000

FAKTUR PAJAK
No. Faktur: FP-2024-003
Tanggal: 25 Januari 2024

1. MAT-001 Material Steel 200 kg 25000 5000000 500000
2. MAT-002 Material Aluminium 150 kg 30000 4500000 450000
3. MAT-003 Material Copper 100 kg 40000 4000000 400000

Total: 13500000
PPN: 1350000
Grand Total: 14850000
```

## Parsing Rules

### Supplier Information
- **Patterns**: "PT", "CV", "Supplier", "Vendor"
- **NPWP Format**: XX.XXX.XXX.X-XXX.XXX
- **Address**: Look for address lines after supplier name

### Invoice Details
- **Nomor Faktur**: "Nomor Faktur", "No. Faktur", "Invoice Number"
- **Tanggal**: "Tanggal", "Date"
- **NPWP**: "NPWP", "Tax ID"

### Item Parsing
- **Primary Patterns**: "1.", "2.", "#1", "#2"
- **Alternative Patterns**: Item codes followed by descriptions
- **Required Fields**: Item code, description, quantity, unit price, total, PPN
- **Units**: pcs, kg, liter, meter, box, pack, unit

### Totals
- **Total Amount**: "Total", "Jumlah"
- **PPN**: "PPN", "Total PPN"
- **Grand Total**: "Grand Total"

## Error Handling

### AI Processing Errors
- **Credentials Issues**: Falls back to manual parsing
- **JSON Parsing Errors**: Uses fallback parsing
- **Network Issues**: Continues with manual processing

### Data Validation
- **Missing Fields**: Generates appropriate defaults
- **Invalid Numbers**: Converts to numeric format
- **Currency Symbols**: Removes and formats properly
- **Empty Data**: Uses empty strings for missing information

## Testing Framework

### Node.js Test Suite
- **File**: `test-faktur-pajak-node.js`
- **Purpose**: Test OCR functions without browser dependencies
- **Coverage**:
  - Text processing with different formats
  - Data conversion and formatting
  - Item parsing with various patterns
  - Error handling and fallback mechanisms

### Test Categories
1. **Text Processing**: Tests with sample Faktur Pajak documents
2. **Data Conversion**: Tests OCR data to application format conversion
3. **Format Variations**: Tests different document layouts
4. **Item Parsing**: Tests individual item line parsing

## Performance Optimization

### Processing Pipeline
1. **PDF Text Extraction**: Using pdf-parse library
2. **AI Processing**: Google Generative AI with optimized prompts
3. **Fallback Parsing**: Manual regex-based parsing
4. **Data Conversion**: Structured data to application format
5. **UI Integration**: Display in Faktur Pajak management interface

### Optimization Features
- **Async Processing**: Non-blocking file processing
- **Batch Processing**: Multiple files processed sequentially
- **Memory Management**: Efficient data structures
- **Error Recovery**: Graceful handling of processing failures

## Security Considerations

### Data Privacy
- **Local Processing**: OCR processing happens locally
- **No Data Storage**: Extracted data not stored externally
- **Secure API Keys**: Google API keys handled securely
- **Input Validation**: All inputs validated before processing

### Error Logging
- **Debug Information**: Detailed logging for troubleshooting
- **Error Messages**: User-friendly error notifications
- **Console Logging**: Development debugging information

## Troubleshooting

### Common Issues

#### 1. AI Processing Fails
- **Symptom**: "Using fallback due to credentials issue"
- **Solution**: Check Google API key configuration
- **Workaround**: System automatically uses fallback parsing

#### 2. Item Parsing Issues
- **Symptom**: Items not extracted correctly
- **Solution**: Check document format matches supported patterns
- **Workaround**: Manual data entry available

#### 3. Data Format Issues
- **Symptom**: Currency or number formatting problems
- **Solution**: Check `formatCurrencyWithGrouping` function
- **Workaround**: Manual data correction in UI

### Debug Information
- **Console Logs**: Detailed processing information
- **Error Messages**: Specific error descriptions
- **Test Results**: Comprehensive test suite output

## Future Enhancements

### Planned Improvements
1. **Enhanced AI Prompts**: More sophisticated prompt engineering
2. **Additional Formats**: Support for more document layouts
3. **Batch Processing**: Parallel processing of multiple files
4. **Data Validation**: Enhanced validation rules
5. **Export Features**: Additional export formats

### Integration Opportunities
1. **Database Integration**: Store processed data in database
2. **API Integration**: Connect to external systems
3. **Reporting**: Generate reports from processed data
4. **Workflow Integration**: Connect to business processes

## Conclusion

The enhanced Faktur Pajak OCR system provides robust, accurate processing of tax invoice documents with comprehensive error handling and fallback mechanisms. The system ensures no hardcoded data is used and maintains high accuracy across various document formats.

The modular architecture allows for easy maintenance and future enhancements while providing reliable performance for production use. 