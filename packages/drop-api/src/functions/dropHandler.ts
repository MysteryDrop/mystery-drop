import { APIGatewayEvent, APIGatewayProxyResult, S3Event } from 'aws-lambda'
import apiResponses from 'src/requests/apiResponses'
import { sign, verify } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { utils } from 'ethers'
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { uuid } from 'uuidv4'
import * as mime from 'mime-types'

import {
  addContentToDrop,
  AddContentToDropParams,
  createDrop,
  CreateDropParams,
  createProfile,
  getNonce,
  updateNonce,
} from '../models/mysteryDropFunctions'

const JWT_EXPIRATION_TIME = '5m'
const MAX_ITEMS_IN_COLLECTION = 6

const client = new S3Client({ region: process.env.AWS_REGION })

const recoverSignature = (nonce, signature) => {
  const msg = `I am signing my one-time nonce: ${nonce}`

  const address = utils.verifyMessage(msg, signature)

  return address
}

/**
 * GET /sessions
 *
 * Returns a nonce given a public address
 * @method nonce
 * @param {String} event.queryStringParameter['PublicAddress']
 * @throws Returns 401 if the user is not found
 * @returns {Object} nonce for the user to sign
 */
export async function nonce(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  const parameters = event.queryStringParameters

  // todo input validation

  const publicAddress = parameters['PublicAddress']
  let nonce
  // const nonce = 'test'

  try {
    nonce = await getNonce({ publicAddress })
    console.log({ nonce })

    if (!nonce) {
      await createProfile({ publicAddress })
    }

    nonce = await updateNonce({ publicAddress })
    return apiResponses._200({ nonce })
  } catch (e) {
    return apiResponses._400({ error: e.message })
  }
}

/**
 * POST /sessions
 *
 * Returns a JWT, given a username and password.
 * @method login
 * @param {String} event.body.username
 * @param {String} event.body.password
 * @throws Returns 401 if the user is not found or password is invalid.
 * @returns {Object} jwt that expires in 5 mins
 */
export async function login(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  try {
    // todo input validation
    const { publicAddress, signature } = JSON.parse(event.body)
    const nonce = await getNonce({ publicAddress })
    // Update nonce so signature can't be replayed
    await updateNonce({ publicAddress })

    if (!nonce) return apiResponses._400({ error: 'user not found' })
    const recoveredAddress = recoverSignature(nonce, signature)

    if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
      const token = sign({ publicAddress }, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRATION_TIME,
      })
      return apiResponses._200({ token })
    } else {
      return apiResponses._400({ error: 'bad signature' })
    }
  } catch (e) {
    return apiResponses._400({ error: e.message })
  }
}

/**
 * OPTION /{proxy+}
 *
 * Returns proper CORS config
 */
export function defaultCORS(event: APIGatewayEvent): APIGatewayProxyResult {
  const response = {
    // Success response
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({}),
  }
  return response
}

/**
 * GET /helloAuth
 *
 * Returns a message given a valid auth header
 * @method helloAuth
 */
export async function helloAuth(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log({ event })
  const user = event.requestContext.authorizer.lambda.user
  return apiResponses._200({ message: `Hello ${user} you are authenticated` })
}

interface ContentMetadata {
  contentId: string // this has to come from the client so they know which url to use for which piece
  contentType: string
  contentTitle: string
  contentDescription: string
}

interface DropMetadata {
  contentType: string
  dropTitle: string
  dropDescription: string
  content: ContentMetadata[]
  numberOfItems: number
}

interface InitiateUploadContentResponse {
  contentId: string
  url: string
}

interface InitiateUploadResponse {
  dropId: string
  user: string
  dropPreviewContentId: string
  dropPreviewUrl: string
  content: InitiateUploadContentResponse[]
}

/**
 * POST /initiateUpload
 *
 *
 * Returns a nonce given a public address
 * @method initiateUpload
 * @param {String} event.body.contentType
 * @param {String} event.body.title
 * @param {String} event.body.description
 * @throws Returns 401 if the user is not found
 * @returns {Object} Pre-signed URL for the user to upload their image
 */
export async function initiateUpload(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log({ event })
  const user = event.requestContext.authorizer.lambda.user

  // TODO validate input matches the expected format - probably use zod
  const dropMetadata = JSON.parse(event.body || '{}') as DropMetadata

  // Make sure number of items matches length
  if (dropMetadata.numberOfItems != dropMetadata.content.length)
    return apiResponses._400({
      error: 'Content length does not match number of items',
    })

  if (dropMetadata.numberOfItems > MAX_ITEMS_IN_COLLECTION)
    return apiResponses._400({ error: 'Exceeds max number of items' })

  const dropId = uuid()
  const dropPreviewContentId = uuid()

  const client = new S3Client({ region: process.env.AWS_REGION })
  const dropPreviewCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `uploads/drop_${dropId}/${dropPreviewContentId}.${mime.extension(
      dropMetadata.contentType
    )!}`,
    ContentType: dropMetadata.contentType,
    Metadata: {
      type: 'PREVIEW',
      dropTitle: dropMetadata.dropTitle,
      dropDescription: dropMetadata.dropDescription,
      numberOfItems: dropMetadata.numberOfItems.toString(),
      dropPreviewContentId,
      contentType: dropMetadata.contentType,
      dropId,
      user,
    },
  })
  console.log({ dropPreviewCommand })
  const dropPreviewUrl = await getSignedUrl(client, dropPreviewCommand, {
    expiresIn: 3600,
  })

  const content: InitiateUploadContentResponse[] = []

  for (let index = 0; index < dropMetadata.numberOfItems; index++) {
    const contentInfo = dropMetadata.content[index]
    const contentPreviewCommand = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `uploads/drop_${dropId}/${contentInfo.contentId}.${mime.extension(
        contentInfo.contentType
      )!}`,
      ContentType: contentInfo.contentType,
      Metadata: {
        type: 'CONTENT',
        contentTitle: contentInfo.contentTitle,
        contentDescription: contentInfo.contentDescription,
        contentId: contentInfo.contentId,
        contentType: contentInfo.contentType,
        dropId,
        user,
      },
    })
    console.log({ contentPreviewCommand })
    const contentPreviewUrl = await getSignedUrl(
      client,
      contentPreviewCommand,
      { expiresIn: 3600 }
    )

    content.push({
      contentId: contentInfo.contentId,
      url: contentPreviewUrl,
    })
  }

  const result: InitiateUploadResponse = {
    dropId,
    user,
    dropPreviewContentId,
    dropPreviewUrl,
    content,
  }

  return apiResponses._200({ result })
}

export async function s3ProcessUploadedPhoto(event: S3Event): Promise<void> {
  const s3Record = event.Records[0].s3

  // First fetch metadata from S3
  const headObjectCommand = new HeadObjectCommand({
    Bucket: s3Record.bucket.name,
    Key: s3Record.object.key,
  })
  const s3Object = await client.send(headObjectCommand)
  if (!s3Object.$metadata) {
    const errorMessage = 'Cannot process content as no metadata is set for it'
    console.error(errorMessage, { s3Object, event })
    throw new Error(errorMessage)
  }

  console.log(JSON.stringify(s3Object.Metadata))

  // Process differently based on metadata type
  if (s3Object.Metadata.type === 'PREVIEW') {
    const dropDetails: CreateDropParams = {
      dropId: s3Object.Metadata.dropid,
      user: s3Object.Metadata.user,
      description: s3Object.Metadata.dropdescription,
      title: s3Object.Metadata.droptitle,
      numberOfItems: s3Object.Metadata.numberofitems,
      id: s3Object.Metadata.droppreviewcontentid,
      contentType: s3Object.Metadata.contenttype,
      key: s3Record.object.key
    }

    await createDrop(dropDetails)

  } else if (s3Object.Metadata.type === 'CONTENT') {
    const contentDetails: AddContentToDropParams = {
      dropId: s3Object.Metadata.dropid,
      user: s3Object.Metadata.user,
      description: s3Object.Metadata.contentdescription,
      title: s3Object.Metadata.contenttitle,
      id: s3Object.Metadata.contentid,
      contentType: s3Object.Metadata.contenttype,
      key: s3Record.object.key
    }

    await addContentToDrop(contentDetails)

  } else {
    throw new Error('Missing metadata type')
  }
}

// todo get presigned fetch URLs for rendering on artist dashboard & minting
