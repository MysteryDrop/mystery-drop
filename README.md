# Mystery Drop

The magic behind MysteryDrop!

MysteryDrop is built on the same principals as collectible box breaks. Artists mint a collection of NFTs and sell ERC20 tokens which are redeemable for one of the NFTs randomly, after the images are revealed.

Using the MysteryDrop app artists can come together to create themed drops and host live streams to reveal their collections. Buyers can then work together to decide if they want to keep the collection intact, as an NFTX fund, or if they want to break it apart into individual pieces.

## How It Works

They key innovation of MysteryDrop involves the order in which we mint NFTs. Since IPFS is a content addressed protocol, we know the location the NFT artwork and metadata will go to BEFORE it is minted. This means that we can actually mint an NFT first, without revealing the image.

First, we create the image for the NFT. Then we simulate an IPFS upload by calculating the CID, but not pinning the content. We then create the metadata JSON and similarly calculate the CID for that file.

Second, we take the CIDs and use the latest Rarible contracts on Rinkeby to mint the NFTs without using the UI. This allows us to see the NFTs on Rarible, but the image files are broken because the IPFS hashes can't find the content.

Third, we create an NFTX vault & deposit our new NFTs into the vault, which creates NFTX XTokens. These are ERC20's which are redeemable for an NFT in the vault, or can be traded on secondary markets.

We deposit these ERC20s into a Token Sale contract at a set price. People can then buy the tokens ahead of the unveiling.

Once we are ready to reveal, we run a script to pin the content. It is deployed to the IPFS CID's that we previously calculated, and the buyers can enjoy the art!

We took full advantage of Austin's scaffold-eth framework. It helped us deliver our project in record time.

## Setup Procedure

1. Mint NFTs

This script calculates the IPFS CIDs for the image & metadata, then mints the NFT using Rarible's contracts

`yarn mint`
![Screen Shot 2021-03-20 at 10 15 52 PM](https://user-images.githubusercontent.com/4401444/111891503-ef3b3a00-89c9-11eb-9113-7e07f7552f51.png)



# About the team
Owen Murovec

@owenmurovec

[murovec.me](http://murovec.me/)

Gianni D'Alerta

[giannidalerta.com](http://giannidalerta.com/)

@giannidalerta

Isaac Patka

@IsaacPatka

@izikp on Clubhouse

ipatka@gmail.com

Mark Redito

@markredito

[markredito.com](http://markredito.com/)
