import axios from 'axios'
import { S3Client } from "@aws-sdk/client-s3";

import { getContent } from "src/models/mysteryDropFunctions"
import { getS3Object } from './utils'

const pinFileToIPFS = async (data) => {
  const pinataApiKey = process.env.PINATA_API_KEY
  const pinataSecretApiKey = process.env.PINATA_SECRET_KEY
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  
  const result = await axios.post(url, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary= ${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
  if (result.status !== 200) throw new Error('failed to pin content')
  return result
};

const pinMetadataToIPFS = async (metadata: string) => {

  const pinataApiKey = process.env.PINATA_API_KEY
  const pinataSecretApiKey = process.env.PINATA_SECRET_KEY

  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

  const result = await axios.post(
    url,
    metadata,
    {
      headers: {
      'pinata_api_key': pinataApiKey, 
      'pinata_secret_api_key': pinataSecretApiKey, 
      'Content-Type': 'application/json'

      }
    }
  )

  if (result.status !== 200) throw new Error('failed to pin metadata')

  return result

};

export const revealContent = async (dropId: string, contentId: string, user: string, client: S3Client) => {
  const contentItems = await getContent({dropId, contentId})
  if (contentItems.length === 0) throw new Error ('content not found')
  const contentItem = contentItems[0]
  if (!contentItem.TokenData || !contentItem.TokenId || !contentItem.TokenMetadata) throw new Error('Token not minted')
  const tokenData =JSON.parse(contentItem.TokenData)
  const tokenId = contentItem.TokenId
  const ownershipId = `${tokenData.contract}:${tokenId}${user}`

  // get owner from Rarible API
  const url = `${process.env.RARIBLE_API_URL_BASE}v0.1/ethereum/nft/ownerships/${ownershipId}`

  console.log({url})

  const result = await axios.get(
    url,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

    if (result.status !== 200) throw new Error('Failed to confirm ownership with Rarible API')

    const ownershipData = result.data

    const owner = ownershipData.owner
    if (owner.toLowerCase() !== user.toLowerCase())
      throw new Error('Unauthorized to reveal this content')

    console.log('REVEAL')
    const s3Key = contentItem.S3ObjectKey

    const content = await getS3Object(s3Key, process.env.BUCKET_NAME, client)

    await pinMetadataToIPFS(contentItem.TokenMetadata)
    await pinFileToIPFS(content)
}
