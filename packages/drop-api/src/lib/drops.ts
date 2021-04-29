import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getContent, getDropsForUser } from 'src/models/mysteryDropFunctions'
import axios from 'axios'

interface GetDropsOutputBase {
  status: string
  dropId: string
}

interface SellOrders {
  success: boolean
  orders: any[]
}

interface ContentData {
  contentId: string
  contentUrl: string
  metadata: { [key: string]: any }
  status: string
  token: any
  orders: SellOrders
}

interface GetDropsOutputProcessed extends GetDropsOutputBase {
  status: 'PROCESSED'
  createdAt: string
  dropPreviewUrl: string
  dropTitle: string
  dropDescription: string
  numberOfItems: string
  contentType: string
  content: ContentData[]
}

interface GetDropsOutputProcessing extends GetDropsOutputBase {
  status: 'PROCESSING'
}

type GetDropsOutput = GetDropsOutputProcessed | GetDropsOutputProcessing

const getSellOrdersByItem = async (
  contractAddress: string,
  tokenId: string
): Promise<SellOrders> => {
  try {
    const url = `${process.env.RARIBLE_API_URL_BASE}v0.1/ethereum/order/orders/sell/byItem?contract=${contractAddress}&tokenId=${tokenId}&sort=LAST_UPDATE`
    const result = await axios.get(url)
    if (result.status !== 200)
      throw new Error('Failed to get sell ordres from Rarible')
    return {
      success: true,
      orders: result.data.orders,
    }
  } catch (e) {
    return { success: false, orders: [] }
  }
}

export const getDropsView = async (
  user: string,
  client: S3Client,
  dropId?: string
) => {
  const drops = await getDropsForUser({ publicAddress: user, dropId })
  console.log({ drops })

  const dropsToReturn: GetDropsOutput[] = []

  if (drops.length) {
    for (let index = 0; index < drops.length; index++) {
      // todo add try catch to handle when content is processed before drop
      // parse dropID from SK
      const drop = drops[index]
      const dropId = drop.SK.split('#DROP#')[1]
      try {
        const dropData = JSON.parse(drop.DropData)
        const getDropPreviewCommand = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: dropData.key,
        })
        const dropPreviewUrl = await getSignedUrl(
          client,
          getDropPreviewCommand,
          {
            expiresIn: 3600,
          }
        )
        const contents = await getContent({ dropId })
        console.log({ contents })
        if (contents.length < parseInt(dropData.numberOfItems))
          throw new Error('still processing')

        const contentData: ContentData[] = []

        for (let index = 0; index < contents.length; index++) {
          const content = contents[index]
          const getContentCommand = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: content.S3ObjectKey,
          })
          const contentUrl = await getSignedUrl(client, getContentCommand, {
            expiresIn: 3600,
          })

          const contentId = content.SK.split('#CONTENT#')[1]

          let orders: SellOrders = { success: false, orders: [] }
          if (content.Status === 'MINTED') {
            console.log('Checking orders')
            orders = await getSellOrdersByItem(
              process.env.TOKEN_CONTRACT_ADDRESS,
              content.TokenId
            )
            console.log({ orders })
          }

          contentData.push({
            contentId,
            contentUrl,
            metadata: content.Metadata,
            token: content.TokenData ? JSON.parse(content.TokenData) : undefined,
            status: content.Status,
            orders,
          })
        }

        dropsToReturn.push({
          status: 'PROCESSED',
          dropPreviewUrl,
          dropTitle: dropData.title,
          dropDescription: dropData.description,
          numberOfItems: dropData.numberOfItems,
          contentType: dropData.contentType,
          dropId,
          content: contentData,
          createdAt: drop.CreatedAt,
        })
      } catch (error) {
        console.log({ error })
        dropsToReturn.push({
          status: 'PROCESSING',
          dropId,
        })
      }
    }
  }
  return dropsToReturn
}
