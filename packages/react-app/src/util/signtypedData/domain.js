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

export const ERC1155Types = {
	Part: [
		{name: 'account', type: 'address'},
		{name: 'value', type: 'uint96'}
	],
	Mint1155: [
		{name: 'tokenId', type: 'uint256'},
		{name: 'supply', type: 'uint256'},
		{name: 'tokenURI', type: 'string'},
		{name: 'creators', type: 'Part[]'},
		{name: 'royalties', type: 'Part[]'}
	]
};

export const orderTypes = {
  AssetType: [
    { name: 'assetClass', type: 'bytes4' },
    { name: 'data', type: 'bytes' },
  ],
  Asset: [
    { name: 'assetType', type: 'AssetType' },
    { name: 'value', type: 'uint256' },
  ],
  Order: [
    { name: 'maker', type: 'address' },
    { name: 'makeAsset', type: 'Asset' },
    { name: 'taker', type: 'address' },
    { name: 'takeAsset', type: 'Asset' },
    { name: 'salt', type: 'uint256' },
    { name: 'start', type: 'uint256' },
    { name: 'end', type: 'uint256' },
    { name: 'dataType', type: 'bytes4' },
    { name: 'data', type: 'bytes' },
  ],
}