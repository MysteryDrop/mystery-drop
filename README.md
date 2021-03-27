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

1. **Mint NFTs**

This script calculates the IPFS CIDs for the image & metadata, then mints the NFT using Rarible's contracts

https://rinkeby.etherscan.io/tx/0x2152758762a45d10b4363ccb61545ba7624576f21cede748c1aed1b9bf9afe6f

`yarn mint`

![Screen Shot 2021-03-20 at 10 15 52 PM](https://user-images.githubusercontent.com/4401444/111891503-ef3b3a00-89c9-11eb-9113-7e07f7552f51.png)


Notice the images are missing

![Screen Shot 2021-03-20 at 10 24 42 PM](https://user-images.githubusercontent.com/4401444/111891693-1ba38600-89cb-11eb-89ba-70cd7c359b07.png)



2. **Create NFTX Vault**

Create:

https://rinkeby.etherscan.io/tx/0x5e1c22d98140daa2fdb7596e492ef851d496f2bbdd9aeb06ce669bd1f6c8eb73

Finalize:

https://rinkeby.etherscan.io/tx/0xab578d358e6019b33e9756b325a2693705e24c6118769f8e3d335879d895d651

Approve minting:

https://rinkeby.etherscan.io/tx/0xb068b43974e76f8f52e21bc560fb0184927dcdd901e56320a113dd90de6fdc9f

Mint:

https://rinkeby.etherscan.io/tx/0x9909c080c1752c589a550b1dffb86b9caacbb909cc902e8ce3cbdd6f8d9128c5

https://rinkeby.nftx.org/#/fund/35

![Screen Shot 2021-03-20 at 10 28 09 PM](https://user-images.githubusercontent.com/4401444/111891759-9371b080-89cb-11eb-9aca-8ae1e500d605.png)
![Screen Shot 2021-03-20 at 10 27 52 PM](https://user-images.githubusercontent.com/4401444/111891760-9371b080-89cb-11eb-8c27-da24245fe504.png)

3. **Deploy Token Sale**

https://rinkeby.etherscan.io/tx/0x3be36ca6a94b0e51138d4ce5a672e2ea9efb1be43cdf6b2c34f06fe145a3c5e4

4. **Deposit XTokens into Token Sale**

https://rinkeby.etherscan.io/tx/0xc26dcb4953dc302958e5838657f7940fd466b4488075cabf8ed4f64eea74a8c6

5. **Sell XTokens on MysteryDrop**

![Screen Shot 2021-03-20 at 11 02 18 PM](https://user-images.githubusercontent.com/4401444/111892288-607deb80-89d0-11eb-8339-476ce252dc78.png)
![Screen Shot 2021-03-20 at 4 54 23 PM](https://user-images.githubusercontent.com/4401444/111892299-84d9c800-89d0-11eb-92a2-e3969dbe57fe.png)

6. **Reveal!**

![Screen Shot 2021-03-20 at 11 04 30 PM](https://user-images.githubusercontent.com/4401444/111892308-ac309500-89d0-11eb-8700-6daaff8a03bd.png)


# About the team
**Isaac Patka**
@IsaacPatka
@izikp on Clubhouse
ipatka@gmail.com

**Owen Murovec**
@owenmurovec
[murovec.me](http://murovec.me/)

**Gianni D'Alerta**
[giannidalerta.com](http://giannidalerta.com/)
@giannidalerta

**Mark Redito**
@markredito
[markredito.com](http://markredito.com/)

Mark created & contributed the beautiful series that you'll see in our demos.

"TX" by Mark Redito x Gian Ferrer

An exploration of moods and emotions through shapes, color, and texture. A visual of continuous flow. 

Very much like blockchain systems that continue to validate and write transactions on an endless ledger, our thoughts and feelings keep moving, iterating, and evolving.

This collection visualizes these emotions.
