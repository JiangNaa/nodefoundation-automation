const XLSX = require('xlsx');

// Create sample data structure
const sampleData = [
  {
    address: '0x1234567890123456789012345678901234567890',
    privatekey: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    address: '0x2345678901234567890123456789012345678901',
    privatekey: 'bcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a'
  },
  {
    address: '0x3456789012345678901234567890123456789012',
    privatekey: 'cdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
  }
];

// Create worksheet
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Create workbook
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Addresses');

// Write to file
XLSX.writeFile(workbook, 'addresses_sample.xlsx');

console.log('Sample Excel file created: addresses_sample.xlsx');
console.log('Please rename to addresses.xlsx and replace with real addresses and private keys before running the main script.'); 