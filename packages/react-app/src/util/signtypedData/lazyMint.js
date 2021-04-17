import {createTypeData, signTypedData} from './sign'
import {ERC721Types, ERC1155Types} from './domain'

export function createLazyMintForm(creator, tokenId, contractAddress, tokenUri) {
  return {
    "@type": "ERC721",
    token: contractAddress,
    tokenId: tokenId,
    // uri: "/ipfs/QmWLsBu6nS4ovaHbGAXprD1qEssJu4r5taQfB74sCG51tp",
    uri: tokenUri,
    creators: [{ account: creator, value: "10000" }],
    royalties: [],
  };
}

export async function signLazyMintMessage(provider, form, account, chainId, verifyingContract) {
  const typeName = form["@type"] === "ERC721" ? "Mint721" : "Mint1155";
  const data = createTypeData(
    {
      name: typeName,
      version: "1",
      chainId,
      verifyingContract,
    },
    typeName,
    { ...form, tokenURI: form.uri },
    form["@type"] === "ERC721" ? ERC721Types : ERC1155Types,
  );
  console.log("signing", data);
  return (await signTypedData(provider, account, data)).sig;
}