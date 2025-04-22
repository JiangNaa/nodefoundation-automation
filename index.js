const Web3 = require('web3');
const XLSX = require('xlsx');
const fs = require('fs');
require('dotenv').config();

// Base network RPC URL - using environment variable or fallback
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// Contract details from environment variables
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x8e7f7a360fb86a3ba464414db2263c50b8a95aa5';
const INPUT_DATA = process.env.INPUT_DATA || '0x2ca15122';
const GAS_LIMIT = parseInt(process.env.GAS_LIMIT || '215523');
const MAX_PRIORITY_FEE = process.env.MAX_PRIORITY_FEE_GWEI || '0.002';
const MAX_FEE = process.env.MAX_FEE_GWEI || '0.003622181';

// Transaction delay
const TX_DELAY = parseInt(process.env.TX_DELAY || '2000');

// Excel file path
const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH || './addresses.xlsx';

// Initialize Web3 for Web3.js 1.x
const web3 = new Web3(new Web3.providers.HttpProvider(BASE_RPC_URL));

// Read addresses and private keys from the Excel file
function readAddressesFromExcel(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return [];
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate data
    const validData = data.filter(row => row.address && row.privatekey);
    
    if (validData.length === 0) {
      console.error('No valid address/privatekey pairs found in the Excel file');
    }
    
    return validData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
}

// Send transaction to the contract
async function sendTransaction(address, privateKey) {
  try {
    // Add '0x' prefix to private key if not already present
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    
    // Get the current nonce for the account
    const nonce = await web3.eth.getTransactionCount(address, 'latest');
    
    // Get current chain ID
    const chainId = await web3.eth.getChainId();
    
    // Create transaction object for EIP-1559
    const tx = {
      from: address,
      to: CONTRACT_ADDRESS,
      nonce: nonce,
      data: INPUT_DATA,
      gas: GAS_LIMIT,
      maxPriorityFeePerGas: web3.utils.toWei(MAX_PRIORITY_FEE, 'gwei'),
      maxFeePerGas: web3.utils.toWei(MAX_FEE, 'gwei'),
      type: '0x2', // EIP-1559 transaction type
      chainId: chainId
    };

    // Sign transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    
    // Send signed transaction
    console.log(`Sending transaction from ${address}...`);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log(`Transaction successful! Transaction hash: ${receipt.transactionHash}`);
    return { success: true, hash: receipt.transactionHash, address };
  } catch (error) {
    console.error(`Error sending transaction from ${address}:`, error.message);
    return { success: false, error: error.message, address };
  }
}

// Main function
async function main() {
  console.log('Base Contract Interaction Script');
  console.log('--------------------------------');
  console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`Input Data: ${INPUT_DATA}`);
  console.log(`Gas Limit: ${GAS_LIMIT}`);
  console.log(`Web3 Version: ${web3.version}`);
  console.log('--------------------------------');
  
  console.log('Reading addresses from Excel file...');
  const addressList = readAddressesFromExcel(EXCEL_FILE_PATH);
  
  if (addressList.length === 0) {
    console.error('No addresses to process. Exiting...');
    return;
  }
  
  console.log(`Found ${addressList.length} addresses to process.`);
  
  // Results arrays
  const successful = [];
  const failed = [];
  
  // Process each address sequentially
  for (let i = 0; i < addressList.length; i++) {
    const { address, privatekey } = addressList[i];
    console.log(`Processing address ${i+1}/${addressList.length}: ${address}`);
    
    const result = await sendTransaction(address, privatekey);
    
    if (result.success) {
      successful.push(result);
    } else {
      failed.push(result);
    }
    
    // Add a delay between transactions
    if (i < addressList.length - 1) {
      console.log(`Waiting ${TX_DELAY/1000} seconds before next transaction...`);
      await new Promise(resolve => setTimeout(resolve, TX_DELAY));
    }
  }
  
  // Output results
  console.log('\n--- RESULTS SUMMARY ---');
  console.log(`Total addresses: ${addressList.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\nSuccessful Transactions:');
    successful.forEach(tx => {
      console.log(`- Address: ${tx.address}, Hash: ${tx.hash}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\nFailed Transactions:');
    failed.forEach(tx => {
      console.log(`- Address: ${tx.address}, Error: ${tx.error}`);
    });
  }
  
  // Write results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = `results-${timestamp}.json`;
  
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: addressList.length,
    successful: successful,
    failed: failed
  }, null, 2));
  
  console.log(`\nResults saved to ${resultsFile}`);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error in main process:', error);
}); 