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


const main = async () => {

  await axios.get('https://gateway.pinata.cloud/ipfs/QmRxyfRwonZo9oXtBGaz2PDbJB7snm6R645irzGqrqKgJh', {timeout: 100}).then(function (response) {
  console.log((response.data))
  })

  


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
