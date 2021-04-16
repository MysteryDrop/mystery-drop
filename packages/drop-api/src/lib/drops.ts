import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getDropsForUser } from "src/models/mysteryDropFunctions"

interface GetDropsOutputBase {
  status: string
  dropId: string
}

interface GetDropsOutputMintable extends GetDropsOutputBase {
  status: 'MINTABLE'
  createdAt: string
  dropPreviewUrl: string
  dropTitle: string
  dropDescription: string
  numberOfItems: string
  contentType: string
  content: {
    contentId: string
    contentTitle: string
  }[]
}

interface GetDropsOutputProcessing extends GetDropsOutputBase {
  status: 'PROCESSING'
}

type GetDropsOutput = GetDropsOutputMintable | GetDropsOutputProcessing

export const getDropsView = async (user: string, client: S3Client) => {
  const drops = await getDropsForUser({ publicAddress: user })
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
        const contentPreviewCommand = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: dropData.key,
        })
        const dropPreviewUrl = await getSignedUrl(
          client,
          contentPreviewCommand,
          {
            expiresIn: 3600,
          }
        )
        const contents = JSON.parse(JSON.stringify(drop.Contents))
        if (contents.length < parseInt(dropData.numberOfItems))
          throw new Error('still processing')

        const contentData = contents.map((content) => {
          console.log({ content })
          const parsedContent = JSON.parse(content)
          return {
            contentId: parsedContent.id,
            contentTitle: parsedContent.title,
          }
        })
        dropsToReturn.push({
          status: 'MINTABLE',
          dropPreviewUrl,
          dropTitle: dropData.title,
          dropDescription: dropData.description,
          numberOfItems: dropData.numberOfItems,
          contentType: dropData.contentType,
          dropId,
          content: contentData,
          createdAt: drop.CreatedAt,
        })
      } catch {
        dropsToReturn.push({
          status: 'PROCESSING',
          dropId,
        })
      }
    }
  }
  return dropsToReturn

}