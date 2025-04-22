//  {
//     "stabe":"0x9DfbB0BD274F6b8e36Fe05912bf5c5DE4b319E5b",
//     "token":"0xF63e2a0169F09882F97f58a34b4bDDF8768dCa06",
//     "factory":"0xa2F391a97D05DD2bbb1Ae19a899f1429992Ce041",
//     "leanController":"0xf98a924B98f8B6700B5a646BC5f217Db392470a3"
// }

// lib/contracts.ts
export const leenFactoryrAddress = "0xaCE3302564cbA291Dc72BD5D55B5434Cb801d845";
export const stablecoinAddress = "0x9DfbB0BD274F6b8e36Fe05912bf5c5DE4b319E5b";



  


export const leenFactoryABI = [
  {
  "inputs": [
    { "internalType": "address", "name": "token", "type": "address" },
    { "internalType": "address", "name": "stablecoin", "type": "address" },
    { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
    { "internalType": "uint256", "name": "collateralRatio", "type": "uint256" },
    { "internalType": "uint256", "name": "liquidationRatio", "type": "uint256" }
  ],
  "name": "createNewPool",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "factory",
  "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
  "stateMutability": "view",
  "type": "function"
},
{
  name: 'getPoolForToken',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ name: 'token', type: 'address' }],
  outputs: [{ type: 'address' }]
},
  {
    "inputs": [],
    "name": "getPools",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const leenPoolABI = [
  {
    "inputs": [],
    "name": "totalBorrowed",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLiquidity",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "config",
    "outputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "address", "name": "stablecoin", "type": "address" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "collateralRatio", "type": "uint256" },
      { "internalType": "uint256", "name": "liquidationRatio", "type": "uint256" },
      { "internalType": "address", "name": "treasury", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    name: 'borrow',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  },
];

export const erc20MetadataABI = [
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [ { name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' } ], outputs: [{ name: '', type: 'bool' }] }
];




