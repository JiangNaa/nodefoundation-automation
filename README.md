# Base Contract Automation

This script automates interactions with a specific contract on the Base network using a list of addresses and private keys from an Excel file.


@nodefnd 自动钱包签名 https://nodefoundation.com。目前除了签名也没看到别的作用，需要钱包里有0.1刀的base_eth做gas ，更少可能也可以 还没测试。目录下的xlsx文件需要包含钱包地址和私钥两列 

NODE 宣布融资 2500 万刀，打造数字艺术的未来

## Setup

1. Install dependencies:
```
npm install
```

2. Create an Excel file named `addresses.xlsx` in the root directory with the following columns:
   - `address`: Ethereum address
   - `privatekey`: Private key for the address

Example format:
| address | privatekey |
|---------|------------|
| 0x1234... | abcdef1234... |
| 0x5678... | ghijkl5678... |

3. Configure the environment variables in the `.env` file if needed.

## Usage

Run the script with:
```
node index.js
```

## Environment Variables

The following environment variables can be configured in the `.env` file:

- `BASE_RPC_URL`: The Base network RPC URL (default: "https://mainnet.base.org")
- `CONTRACT_ADDRESS`: The target contract address (default: "0x8e7f7a360fb86a3ba464414db2263c50b8a95aa5")
- `INPUT_DATA`: The input data for the contract interaction (default: "0x2ca15122")
- `GAS_LIMIT`: Gas limit for transactions (default: 215523)
- `MAX_PRIORITY_FEE_GWEI`: Max priority fee in Gwei (default: 0.002)
- `MAX_FEE_GWEI`: Max fee in Gwei (default: 0.003622181)
- `EXCEL_FILE_PATH`: Path to the Excel file (default: "./addresses.xlsx")
- `TX_DELAY`: Delay between transactions in milliseconds (default: 2000)

## Results

The script saves results to a timestamped JSON file, including successful and failed transactions. 