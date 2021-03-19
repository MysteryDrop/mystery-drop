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

// struct Mint721Data {
//   uint tokenId;
//   string uri;
//   address[] creators;
//   LibFee.Fee[] royalties;
//   bytes[] signatures;
//  }

const main = async () => {
  

  // ADDRESS TO MINT TO:
  const toAddress = "0xc06C06637B1F3bC0D66c7414e78Ba183863a7014"

  const contractAddress = "0x25646B08D9796CedA5FB8CE0105a51820740C049"

  const tokenId = "0x13b4d7d5ef52959a01cd512bd3720b8217a5fd56000000000000000000000010"

  console.log("\n\n 🎫 Minting to "+toAddress+"...\n");
  const filePath = '/Users/isaacpatka/hackathon/nfthack/scaffold-eth/packages/hardhat/scripts/NFTHackLogo.png'
    
  console.log("Calculating logo...")
  console.log("revealing logo...")
  const uploadedImage = await pinFileToIPFS(pinataApiKey, pinataSecretApiKey, filePath)
  console.log({uploadedImage})
  const externalUrl = `https://rinkeby.rarible.com/${contractAddress}:${tokenId}`

  const metadata = {
    "name": "NFTHack Logo",
    "description": "Logo",
    "image": `ipfs://ipfs/${uploadedImage.IpfsHash}`,
    "external_url": externalUrl,
    "attributes": [
       {
          "key": "test",
          "trait_type": "test",
          "value": "test"
       }
    ]
 }


  const uploadedMetadata = await pinMetadataToIPFS(pinataApiKey, pinataSecretApiKey, metadata)

  console.log("Revealing NFT with IPFS hash ("+"ipfs/"+uploadedMetadata.IpfsHash+")")

  await sleep(delayMS)


  // const zebra = {
  //   "description": "What is it so worried about?",
  //   "external_url": "https://austingriffith.com/portfolio/paintings/",// <-- this can link to a page for the specific file too
  //   "image": "https://austingriffith.com/images/paintings/zebra.jpg",
  //   "name": "Zebra",
  //   "attributes": [
  //      {
  //        "trait_type": "BackgroundColor",
  //        "value": "blue"
  //      },
  //      {
  //        "trait_type": "Eyes",
  //        "value": "googly"
  //      },
  //      {
  //        "trait_type": "Stamina",
  //        "value": 38
  //      }
  //   ]
  // }
  // console.log("Uploading zebra...")
  // const uploadedzebra = await ipfs.add(JSON.stringify(zebra))

  // console.log("Minting zebra with IPFS hash ("+uploadedzebra.path+")")
  // await rari.mintAndTransfer(toAddress,uploadedzebra.path,{gasLimit:400000})



  // await sleep(delayMS)


  // const rhino = {
  //   "description": "What a horn!",
  //   "external_url": "https://austingriffith.com/portfolio/paintings/",// <-- this can link to a page for the specific file too
  //   "image": "https://austingriffith.com/images/paintings/rhino.jpg",
  //   "name": "Rhino",
  //   "attributes": [
  //      {
  //        "trait_type": "BackgroundColor",
  //        "value": "pink"
  //      },
  //      {
  //        "trait_type": "Eyes",
  //        "value": "googly"
  //      },
  //      {
  //        "trait_type": "Stamina",
  //        "value": 22
  //      }
  //   ]
  // }
  // console.log("Uploading rhino...")
  // const uploadedrhino = await ipfs.add(JSON.stringify(rhino))

  // console.log("Minting rhino with IPFS hash ("+uploadedrhino.path+")")
  // await rari.mintAndTransfer(toAddress,uploadedrhino.path,{gasLimit:400000})



  // await sleep(delayMS)


  // const fish = {
  //   "description": "Is that an underbyte?",
  //   "external_url": "https://austingriffith.com/portfolio/paintings/",// <-- this can link to a page for the specific file too
  //   "image": "https://austingriffith.com/images/paintings/fish.jpg",
  //   "name": "Fish",
  //   "attributes": [
  //      {
  //        "trait_type": "BackgroundColor",
  //        "value": "blue"
  //      },
  //      {
  //        "trait_type": "Eyes",
  //        "value": "googly"
  //      },
  //      {
  //        "trait_type": "Stamina",
  //        "value": 15
  //      }
  //   ]
  // }
  // console.log("Uploading fish...")
  // const uploadedfish = await ipfs.add(JSON.stringify(fish))

  // console.log("Minting fish with IPFS hash ("+uploadedfish.path+")")
  // await rari.mintAndTransfer(toAddress,uploadedfish.path,{gasLimit:400000})



  // await sleep(delayMS)


  // const flamingo = {
  //   "description": "So delicate.",
  //   "external_url": "https://austingriffith.com/portfolio/paintings/",// <-- this can link to a page for the specific file too
  //   "image": "https://austingriffith.com/images/paintings/flamingo.jpg",
  //   "name": "Flamingo",
  //   "attributes": [
  //      {
  //        "trait_type": "BackgroundColor",
  //        "value": "black"
  //      },
  //      {
  //        "trait_type": "Eyes",
  //        "value": "googly"
  //      },
  //      {
  //        "trait_type": "Stamina",
  //        "value": 6
  //      }
  //   ]
  // }
  // console.log("Uploading flamingo...")
  // const uploadedflamingo = await ipfs.add(JSON.stringify(flamingo))

  // console.log("Minting flamingo with IPFS hash ("+uploadedflamingo.path+")")
  // await rari.mintAndTransfer(toAddress,uploadedflamingo.path,{gasLimit:400000})





  // const godzilla = {
  //   "description": "Raaaar!",
  //   "external_url": "https://austingriffith.com/portfolio/paintings/",// <-- this can link to a page for the specific file too
  //   "image": "https://austingriffith.com/images/paintings/godzilla.jpg",
  //   "name": "Godzilla",
  //   "attributes": [
  //      {
  //        "trait_type": "BackgroundColor",
  //        "value": "orange"
  //      },
  //      {
  //        "trait_type": "Eyes",
  //        "value": "googly"
  //      },
  //      {
  //        "trait_type": "Stamina",
  //        "value": 99
  //      }
  //   ]
  // }
  // console.log("Uploading godzilla...")
  // const uploadedgodzilla = await ipfs.add(JSON.stringify(godzilla))

  // console.log("Minting godzilla with IPFS hash ("+uploadedgodzilla.path+")")
  // await rari.mintAndTransfer(toAddress,uploadedgodzilla.path,{gasLimit:400000})




  // await sleep(delayMS)

  console.log("Transferring Ownership of YourCollectible to "+toAddress+"...")

  // await rari.transferOwnership(toAddress)

  await sleep(delayMS)

  /*


  console.log("Minting zebra...")
  await yourCollectible.mintAndTransfer("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1","zebra.jpg")

  */


  //const secondContract = await deploy("SecondContract")

  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])



  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */


  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */


  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

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
