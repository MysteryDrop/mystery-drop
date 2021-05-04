import * as hash from 'ipfs-only-hash'
import axios from 'axios'
import { S3Client } from '@aws-sdk/client-s3'

import {
  addMintDataToContent,
  addTokenDataToContent,
  getContent,
  getTokenForMinting,
} from '../models/mysteryDropFunctions'
import { getS3Object } from './utils'


// split this out so we can test it with a snapshot to catch changes
const calculateIpfsHash = async (content: any) => {return await hash.of(content)}

const getNextTokenId = async (user: string) => {
  const url = `${process.env.RARIBLE_API_URL_BASE}v0.1/ethereum/nft/collections/${process.env.TOKEN_CONTRACT_ADDRESS}/generate_token_id?minter=${user}`
  const tokenIdRes = await axios.get(url)
  if (tokenIdRes.status !== 200)
    throw new Error('Failed to get tokenId from Rarible')
  const tokenId = tokenIdRes.data.tokenId
  return tokenId
}

const generateTokenMetadata = (params: {
  tokenId: string
  name: string
  description: string
  contentIpfsHash: string
}) => {
  // Calculate token metadata hash
  const externalUrl = `${process.env.TOKEN_EXTERNAL_URL_BASE}${process.env.TOKEN_CONTRACT_ADDRESS}:${params.tokenId}`
  const metadata = {
    name: params.name,
    description: params.description,
    image: `ipfs://ipfs/${params.contentIpfsHash}`,
    external_url: externalUrl,
    // TODO add attributes maybe
  }
  return JSON.stringify(metadata)
}

export const preprocessContent = async (
  dropId: string,
  contentId: string,
  user: string,
  client: S3Client
) => {
  const contentItems = await getContent({ dropId, contentId })
  if (contentItems.length === 0) throw new Error ('content not found')
  const contentItem = contentItems[0]

  // Check if authorized to mint
  if (contentItem.Creator.toLowerCase() !== user.toLowerCase())
    throw new Error('Unauthorized to mint this content')

  // fetch key from dynamodb
  const s3Key = contentItem.S3ObjectKey

  const content = await getS3Object(s3Key, process.env.BUCKET_NAME, client)

  const contentIpfsHash = await calculateIpfsHash(content)

  const tokenId = await getNextTokenId(user)

  const tokenMetadata = generateTokenMetadata({
    tokenId,
    name: contentItem.Metadata.title,
    description: contentItem.Metadata.description,
    contentIpfsHash,
  })

  const metadataIpfsHash = await calculateIpfsHash(tokenMetadata)
  const tokenUri = `ipfs/${metadataIpfsHash}`

  await addTokenDataToContent({
    tokenId,
    dropId,
    contentId,
    tokenMetadata,
    tokenUri,
  })

  return {
    tokenId,
    tokenUri,
    contractAddress: process.env.TOKEN_CONTRACT_ADDRESS,
    chainId: process.env.CHAIN_ID,
  }
}

export const submitLazyMint = async (
  dropId: string,
  contentId: string,
  user: string,
  signature: string
) => {
  const contentItem = await getTokenForMinting({ dropId, contentId })

  if (contentItem.Status !== 'MINTABLE') throw new Error(`Content not mintable, has status: ${contentItem.Status}`)
  const creators = [{ account: user, value: 10000 }]

  const url = `${process.env.RARIBLE_API_URL_BASE}v0.1/ethereum/nft/mints`

  const result = await axios.post(
    url,
    {
      '@type': 'ERC721',
      contract: process.env.TOKEN_CONTRACT_ADDRESS,
      tokenId: contentItem.TokenId,
      uri: contentItem.TokenUri,
      creators,
      royalties: [],
      signatures: [signature],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

    if (result.status !== 200) throw new Error('failed to mint with Rarible API')

    const tokenData = result.data

    await addMintDataToContent({dropId, contentId, tokenData: JSON.stringify(tokenData)})
    return tokenData

}


// "tokenData": {
//   "id": "0x6ede7f3c26975aad32a475e1021d8f6f39c89d82:0x83bc06079538264cc18829c5534387c69820a4e6000000000000000000000010",
//   "token": "0x6ede7f3c26975aad32a475e1021d8f6f39c89d82",
//   "tokenId": "0x83bc06079538264cc18829c5534387c69820a4e6000000000000000000000010",
//   "unlockable": false,
//   "supply": 1,
//   "lazySupply": 1,
//   "owners": [
//     "0x83bc06079538264cc18829c5534387c69820a4e6"
//   ],
//   "royalties": []
// }