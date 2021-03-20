/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

const delayMS = 1000 //sometimes xDAI needs a 6000ms break lol 😅

const mintWithoutPin = async (tokenId, filePath, nftName, dog) => {
  // ADDRESS TO MINT TO:
  const toAddress = "0xc06C06637B1F3bC0D66c7414e78Ba183863a7014"

  const creatorAddress = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD"

  const contractAddress = "0x25646B08D9796CedA5FB8CE0105a51820740C049"

  console.log("\n\n 🎫 Minting to "+toAddress+"...\n");


   const contractAbi = JSON.parse(
      `[ { "inputs": [ { "components": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "string", "name": "uri", "type": "string" }, { "internalType": "address[]", "name": "creators", "type": "address[]" }, { "components": [ { "internalType": "address payable", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "internalType": "struct LibPart.Part[]", "name": "royalties", "type": "tuple[]" }, { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" } ], "internalType": "struct LibERC721LazyMint.Mint721Data", "name": "data", "type": "tuple" }, { "internalType": "address", "name": "to", "type": "address" } ], "name": "mintAndTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "newOwner", "type": "address" }, { "internalType": "string", "name": "contractURI", "type": "string" }, { "internalType": "string", "name": "tokenURIPrefix", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "indexed": false, "internalType": "uint256[]", "name": "bps", "type": "uint256[]" } ], "name": "SecondarySaleFees", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "contractURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "fees", "outputs": [ { "internalType": "address payable", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getApproved", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" } ], "name": "getFeeBps", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" } ], "name": "getFeeRecipients", "outputs": [ { "internalType": "address payable[]", "name": "", "type": "address[]" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" } ], "name": "isApprovedForAll", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "isOwner", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }, { "components": [ { "internalType": "address payable", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "internalType": "struct ERC721Base.Fee[]", "name": "_fees", "type": "tuple[]" }, { "internalType": "string", "name": "tokenURI", "type": "string" } ], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ownerOf", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" } ], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "setApprovalForAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "string", "name": "contractURI", "type": "string" } ], "name": "setContractURI", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "string", "name": "tokenURIPrefix", "type": "string" } ], "name": "setTokenURIPrefix", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "tokenByIndex", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "tokenOfOwnerByIndex", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "tokenURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "tokenURIPrefix", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]`
    )

  const rari = await ethers.getContractAt(contractAbi, contractAddress)

  console.log("Calculating image content...")
  const dataToUpload = fs.createReadStream(filePath);
  const ipfsResult = await ipfs.add(dataToUpload, {onlyHash: true})

  const externalUrl = `https://rinkeby.rarible.com/token/${contractAddress}:${tokenId}`
  const metadata = {
    "name": nftName,
    "description": "Demo NFT using Pexel free images",
    "image": `ipfs://ipfs/${ipfsResult.path}`,
    "external_url": externalUrl,
    "attributes": [
       {
          "key": "dog",
          "trait_type": "bool",
          "value": dog
       }
    ]
 }

  const ipfsResultMetadata = await ipfs.add(JSON.stringify(metadata), {onlyHash: true})

  console.log("Minting image with IPFS hash ("+"ipfs/"+ipfsResultMetadata.path+")")
  console.log("Minting NFT with token id ("+tokenId+")")
  await rari.mintAndTransfer([tokenId, "ipfs/"+ipfsResultMetadata.path, [creatorAddress], [], ["0x"]], toAddress)

}

const main = async () => {

  // IMAGE 1
  const tokenId1 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000008"
  const filePath1 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-anna-shvets-4588047.jpg'
  await mintWithoutPin(tokenId1, filePath1, 'Valentine', 'true')
  await sleep(delayMS)

  // IMAGE 2
  const tokenId2 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000009"
  const filePath2 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-anna-shvets-4588435.jpg'
  await mintWithoutPin(tokenId2, filePath2, 'Hoodie', 'true')
  await sleep(delayMS)

  // IMAGE 3
  const tokenId3 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000010"
  const filePath3 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-mathilde-langevin-7082442.jpg'
  await mintWithoutPin(tokenId3, filePath3, 'Cat', 'false')
  await sleep(delayMS)

  // IMAGE 4
  const tokenId4 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000011"
  const filePath4 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-sam-lion-5732461.jpg'
  await mintWithoutPin(tokenId4, filePath4, 'Doctor', 'true')
  await sleep(delayMS)

  // IMAGE 5
  const tokenId5 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000012"
  const filePath5 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-valeria-boltneva-1805164.jpg'
  await mintWithoutPin(tokenId5, filePath5, 'Doge', 'true')

};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
