import * as hash from 'ipfs-only-hash'
import axios from 'axios'

import {
  addTokenDataToContent,
  getContent,
} from '../models/mysteryDropFunctions'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

const getS3Object = async (
  s3Key: string,
  bucketName: string,
  client: S3Client
) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  })
  const s3Object = await client.send(getObjectCommand)
  if (!s3Object.$metadata) {
    const errorMessage = 'Cannot process content as no metadata is set for it'
    console.error(errorMessage, { s3Object })
    throw new Error(errorMessage)
  }

  const content = s3Object.Body

  return content
}

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
  const contentItem = await getContent({ dropId, contentId })

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
