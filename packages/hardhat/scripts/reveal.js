/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

const axios = require("axios");
const FormData = require("form-data");

const pinataApiKey = "86303fe8b5766c820e85"
const pinataSecretApiKey = "0a6b231c8cd63ba2672df309178916d981ba36bd30ad3abf3e6f128d30ea51ee"

const pinFileToIPFS = async (pinataApiKey, pinataSecretApiKey, filePath) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  
  data.append("file", fs.createReadStream(filePath));
  
  const uploaded = await axios.post(url, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary= ${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    .then(function (response) {
      console.log(response.data);
      return response.data
    })
    .catch(function (error) {
      console.log(error)
    });
  return uploaded
};

const pinMetadataToIPFS = async (pinataApiKey, pinataSecretApiKey, metadata) => {
  let data = JSON.stringify(metadata)

  const config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
      'pinata_api_key': pinataApiKey, 
      'pinata_secret_api_key': pinataSecretApiKey, 
      'Content-Type': 'application/json'
    },
    data: data
  };

  const uploaded = await axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    return response.data
  }).catch(function (error) {
    console.log(error);
  });

   return uploaded
};

const delayMS = 1000 //sometimes xDAI needs a 6000ms break lol 😅

const reveal = async (tokenId, filePath, nftName, dog) => {
  const contractAddress = "0x25646B08D9796CedA5FB8CE0105a51820740C049"

  console.log("Revealing image...")
  const uploadedImage = await pinFileToIPFS(pinataApiKey, pinataSecretApiKey, filePath)
  // TODO add token to this URL
  const externalUrl = `https://rinkeby.rarible.com/${contractAddress}:${tokenId}`

  const metadata = {
    "name": nftName,
    "description": "Demo NFT using Pexel free images",
    "image": `ipfs://ipfs/${uploadedImage.IpfsHash}`,
    "external_url": externalUrl,
    "attributes": [
       {
          "key": "dog",
          "trait_type": "bool",
          "value": dog
       }
    ]
 }

  const uploadedMetadata = await pinMetadataToIPFS(pinataApiKey, pinataSecretApiKey, metadata)
  console.log("Revealing NFT with IPFS hash ("+"ipfs/"+uploadedMetadata.IpfsHash+")")

}

const main = async () => {

  // IMAGE 1
  const tokenId1 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000008"
  const filePath1 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-anna-shvets-4588047.jpg'
  await reveal(tokenId1, filePath1, 'Valentine', 'true')
  await sleep(delayMS)

  // IMAGE 2
  const tokenId2 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000009"
  const filePath2 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-anna-shvets-4588435.jpg'
  await reveal(tokenId2, filePath2, 'Hoodie', 'true')
  await sleep(delayMS)

  // IMAGE 3
  const tokenId3 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000010"
  const filePath3 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-mathilde-langevin-7082442.jpg'
  await reveal(tokenId3, filePath3, 'Cat', 'false')
  await sleep(delayMS)

  // IMAGE 4
  const tokenId4 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000011"
  const filePath4 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-sam-lion-5732461.jpg'
  await reveal(tokenId4, filePath4, 'Doctor', 'true')
  await sleep(delayMS)

  // IMAGE 5
  const tokenId5 = "0x34728Ddf96521964B7D0Ce263886564BC21A7dCD000000000000000000000012"
  const filePath5 = '/Users/isaacpatka/hackathon/nfthack/mysterydrop/scaffold-eth/packages/hardhat/scripts/images/pexels-valeria-boltneva-1805164.jpg'
  await reveal(tokenId5, filePath5, 'Doge', 'true')
  await sleep(delayMS)


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
