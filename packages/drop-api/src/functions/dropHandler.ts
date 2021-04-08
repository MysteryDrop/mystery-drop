import { APIGatewayEvent, APIGatewayProxyResult, S3Event } from 'aws-lambda'
import apiResponses from 'src/requests/apiResponses'
import { sign, verify } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { utils } from 'ethers'
import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uuid } from 'uuidv4';
import * as mime from 'mime-types'


import { createProfile, getNonce, updateNonce } from '../models/mysteryDropFunctions'

const JWT_EXPIRATION_TIME = '5m'

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

  const publicAddress = parameters['PublicAddress']
  let nonce
  // const nonce = 'test'

  try {
    nonce = await getNonce({publicAddress})
    console.log({nonce})

    if (!nonce) {
      await createProfile({publicAddress})
    }

    nonce = await updateNonce({publicAddress})
    return apiResponses._200({nonce})
  } catch (e) {
    return apiResponses._400({error: e.message})
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
    const { publicAddress, signature } = JSON.parse(event.body)
    const nonce = await getNonce({publicAddress})
    // Update nonce so signature can't be replayed
    await updateNonce({publicAddress})

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
export async function helloAuth(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  console.log({event})
  const user = event.requestContext.authorizer.lambda.user
  return apiResponses._200({ message: `Hello ${user} you are authenticated`})
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
export async function initiateUpload(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  console.log({event})
  const user = event.requestContext.authorizer.lambda.user
  const body = JSON.parse(event.body || '{}');

  const contentMetadata = {
    contentType: body.contentType,
    title: body.title,
    description: body.description
  }

  // todo make this work for mystery drop fields
  const dropId = uuid()
  const photoId = uuid()

  const client = new S3Client({ region: process.env.AWS_REGION });
  const command = new PutObjectCommand(
    {
      Bucket: process.env.BUCKET_NAME,
      Key: `uploads/drop_${dropId}/${photoId}.${mime.extension(contentMetadata.contentType)!}` ,
      ContentType: contentMetadata.contentType,
      Metadata: {
        ...(contentMetadata),
        photoId,
        dropId,
      }
    }
  );
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  const result= {
    dropId,
    user,
    photoId,
    url,
  };

  return apiResponses._200({ result })
}

export async function s3ProcessUploadedPhoto(event: S3Event): Promise<void> {
  const s3Record = event.Records[0].s3;

  const client = new S3Client({ region: process.env.AWS_REGION });
  // First fetch metadata from S3
  const headObjectCommand = new HeadObjectCommand({
    Bucket: s3Record.bucket.name,
    Key: s3Record.object.key
  })
  const s3Object = await client.send(headObjectCommand)
  if (!s3Object.$metadata) {
    // Shouldn't get here
    const errorMessage = 'Cannot process content as no metadata is set for it';
    console.error(errorMessage, { s3Object, event });
    throw new Error(errorMessage);
  }
  // S3 metadata field names are converted to lowercase, so need to map them out carefully
  const contentDetails = {
    dropId: s3Object.Metadata.dropId,
    user: s3Object.Metadata.user,
    description: s3Object.Metadata.description,
    title: s3Object.Metadata.title,
    id: s3Object.Metadata.photoid,
    contentType: s3Object.Metadata.contenttype,
    key: s3Record.object.key,
  };
  // Now write to DDB - todo process multiple image uploads in the same drop
  // const result = await MysteryDrop.primaryKey.get(contentDetails.user)
  // await savePhoto(photoDetails);

}

// todo get presigned fetch URLs for rendering on artist dashboard & minting