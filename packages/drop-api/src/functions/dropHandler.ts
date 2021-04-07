import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import apiResponses from 'src/requests/apiResponses'
import { sign, verify } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { utils } from 'ethers'

import { MysteryDrop } from '../models/mysteryDropFunctions'

const JWT_EXPIRATION_TIME = '5m'

const getNonce = async () => {
  const buffer = await randomBytes(16)
  return buffer.toString('hex')
}

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

  try {
    // TODO this could probably be simplified to just call update and not check if one exists yet
    const result = await MysteryDrop.primaryKey.get(publicAddress)

    if (!result) {
      const user = new MysteryDrop()

      user.PublicAddress = publicAddress

      nonce = await getNonce()
      user.Nonce = nonce

      await user.save()
    } else {
      nonce = await getNonce()
      await MysteryDrop.primaryKey.update(publicAddress, {
        Nonce: ['PUT', nonce],
      })
    }

    const response = {
      // Success response
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        nonce,
      }),
    }
    return response
  } catch (e) {
    const response = {
      // Error response
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: e.message,
      }),
    }
    return response
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
    const result = await MysteryDrop.primaryKey.get(publicAddress)

    const recoveredAddress = recoverSignature(result.Nonce, signature)
    if (!result) return apiResponses._400({ error: 'user not found' })

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
 */
export async function helloAuth(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  console.log({event})
  const user = event.requestContext.authorizer.lambda.user
  return apiResponses._200({ message: `Hello ${user} you are authenticated`})
}
