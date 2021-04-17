export const ERC721Types = {
	Part: [
		{name: 'account', type: 'address'},
		{name: 'value', type: 'uint96'}
	],
	Mint721: [
		{name: 'tokenId', type: 'uint256'},
		{name: 'tokenURI', type: 'string'},
		{name: 'creators', type: 'Part[]'},
		{name: 'royalties', type: 'Part[]'}
	]
};

async function sign(signer, tokenId, tokenURI, creators, royalties, verifyingContract) {
  const chainId = Number(await signer.getChainId());
  const domain = {
    name: "Mint721",
    chainId,
    version: "1",
    verifyingContract,
  };
  const data = {
    tokenId,
    tokenURI,
    creators,
    royalties
  }
  console.log({domain})
  console.log({data})
  return (await signer._signTypedData(domain, ERC721Types, data));
}


module.exports = { sign };
