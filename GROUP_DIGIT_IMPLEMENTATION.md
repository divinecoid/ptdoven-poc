# Implementasi Group Digit pada Data EDI PO

## Overview
Telah ditambahkan fitur group digit pada hasil data EDI di halaman PO. Group digit diekstrak dari digit pertama pada item code, dan angka-angka ditampilkan dengan grouping digit untuk memudahkan pembacaan.

## Perubahan yang Dilakukan

### 1. Fungsi extractGroupDigit
- Ditambahkan fungsi `extractGroupDigit()` di `src/logic/po.js`
- Fungsi ini mengekstrak digit pertama dari item code
- Menangani berbagai format item code (angka, alfanumerik, dll)

### 2. Fungsi formatNumberWithGrouping
- Ditambahkan fungsi `formatNumberWithGrouping()` di `src/logic/po.js`
- Fungsi ini memformat angka dengan grouping digit (format Indonesia)
- Contoh: 1000000 → 1.000.000
- Menangani berbagai format input (string, number, dll)

### 3. Update Parsing EDI
- Dimodifikasi fungsi `parsePOEDI()` untuk menambahkan group digit
- Setiap item sekarang memiliki properti `groupDigit`
- Group digit diekstrak dari item code saat parsing

### 4. Update Tampilan Tabel
- Ditambahkan kolom "Group Digit" di header tabel
- Data group digit ditampilkan di kolom terpisah
- Format: menampilkan group digit atau "-" jika tidak ada
- **Total Items**: Angka ditampilkan dengan grouping digit
- **Item Total**: Angka ditampilkan dengan grouping digit

### 5. Update Detail View
- Ditambahkan informasi group digit di detail item
- Ditampilkan di bagian item details dengan label "Group:"
- **Total Amount**: Angka ditampilkan dengan grouping digit
- **Item Total**: Angka ditampilkan dengan grouping digit
- **OCR Financial Details**: Semua field financial ditampilkan dengan grouping digit

## Contoh Hasil

### Input EDI:
```
LIN|TAS BELANJA|4|0|4324992|12345678910|1000|BAG|250|0.00%||1000|0|1000000|0|0|0|1.00%
LIN|KERANJANG PLASTIK|2|0|12345678910|98765432100|500|PCS|100|5.00%||950|0|500000|0|0|0|2.00%
```

### Output:
- Item Code: 4324992 → Group Digit: 4
- Item Code: 12345678910 → Group Digit: 1
- Total Amount: 1000000 → 1.000.000
- Item Total: 1000 → 1.000

## File yang Dimodifikasi

1. `src/logic/po.js`
   - Tambah fungsi `extractGroupDigit()`
   - Update fungsi `parsePOEDI()`
   - Update fungsi `renderAllDataTable()`
   - Update fungsi `showFileDetail()`

2. `src/page/po.html`
   - Tambah kolom "Group Digit" di header tabel

## Testing
- Fungsi group digit telah ditest dengan berbagai format item code
- Parsing EDI dengan group digit telah diverifikasi
- Tampilan tabel dan detail view telah diupdate

## Catatan
- Group digit hanya ditampilkan untuk data EDI
- Untuk data OCR, group digit tidak ditampilkan (karena bukan format EDI)
- Group digit diekstrak dari digit pertama yang ditemukan dalam item code
- **Penting**: Data yang sudah ada di localStorage akan otomatis ditambahkan group digit saat halaman dimuat
- Group digit ditampilkan dengan background biru untuk memudahkan identifikasi

## Troubleshooting

### Jika group digit tidak muncul:
1. **Refresh halaman** - Fungsi `addGroupDigitToExistingData()` akan menambahkan group digit ke data yang sudah ada
2. **Upload ulang file EDI** - File baru akan otomatis memiliki group digit
3. **Periksa console browser** - Akan ada log "Group digit added to existing data" jika ada data yang diupdate

### Tampilan Group Digit:
- **Tabel**: Ditampilkan di kolom "Group Digit" dengan background biru
- **Detail View**: Ditampilkan di bagian item details dengan label "Group:" dan background biru
- **Format**: Digit pertama dari item code (contoh: 4324992 → Group: 4)

### Tampilan Number Grouping:
- **Total Amount**: 1.000.000 (format Indonesia)
- **Item Total**: 1.000 (format Indonesia)
- **OCR Financial Fields**: Semua field financial menggunakan format Indonesia
- **Format**: Menggunakan titik sebagai pemisah ribuan (1.000.000) 