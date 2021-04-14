import { DynamoDB } from 'aws-sdk'
import { randomBytes } from 'crypto'

const client = new DynamoDB()
const documentClient = new DynamoDB.DocumentClient({ service: client })

const generateNonce = async () => {
  const buffer = await randomBytes(16)
  return buffer.toString('hex')
}

const tableName = process.env.DYNAMODB_TABLE

// Merchant Profiles
interface CreateProfileParams {
  publicAddress: string
}

export const createProfile = async (params: CreateProfileParams) => {
  const queryParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: {
      PK: `USER#${params.publicAddress}`,
      SK: `#PROFILE#${params.publicAddress}`,
      CreatedAt: new Date().toISOString(),
      Nonce: await generateNonce(),
    },
  }

  return documentClient
    .put(queryParams)
    .promise()
    .then((data) => data)
}

export const getNonce = (params: { publicAddress: string }) => {
  const queryParams: DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      PK: `USER#${params.publicAddress}`,
      SK: `#PROFILE#${params.publicAddress}`,
    },
    ProjectionExpression: 'Nonce',
  }
  console.log({ queryParams })
  return documentClient
    .get(queryParams)
    .promise()
    .then((data) => data.Item?.Nonce)
}

export const updateNonce = async (params: { publicAddress: string }) => {
  const newNonce = await generateNonce()
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `USER#${params.publicAddress}`,
      SK: `#PROFILE#${params.publicAddress}`,
    },
    UpdateExpression: 'set Nonce = :n',
    ExpressionAttributeValues: {
      ':n': newNonce,
    },
    ReturnValues: 'UPDATED_NEW',
  }
  console.log({ queryParams })
  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data.Attributes.Nonce)
}

export interface CreateDropParams {
  dropId: string
  user: string
  description: string
  title: string
  numberOfItems: string
  id: string
  contentType: string
  key: string
}

export interface AddContentToDropParams {
  dropId: string
  user: string
  description: string
  title: string
  id: string
  contentType: string
  key: string
}

// Create drop
export const createDrop = async (params: CreateDropParams) => {
  const paramsToAdd = JSON.stringify(params)
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `USER#${params.user}`,
      SK: `#DROP#${params.dropId}`,
    },
    UpdateExpression: 'set #DD = :d, #CA = :c',
    ExpressionAttributeNames: { '#DD': 'DropData', '#CA': 'CreatedAt' },
    ExpressionAttributeValues: {
      ':d': paramsToAdd,
      ':c': new Date().toISOString(),
    },
  }

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)
}

export const addContentToDrop = async (params: AddContentToDropParams) => {
  // todo validate input with zod
  const paramsToAdd = JSON.stringify(params)
  console.log({ paramsToAdd })
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `USER#${params.user}`,
      SK: `#DROP#${params.dropId}`,
    },
    UpdateExpression: 'ADD #contents :content',
    ExpressionAttributeNames: { '#contents': 'Contents' },
    ExpressionAttributeValues: {
      ':content': documentClient.createSet([paramsToAdd]),
    },
  }

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)
}

// Get drop
export const getDropsForUser = (params: { publicAddress: string }) => {
  const queryParams: DynamoDB.DocumentClient.QueryInput = {
    TableName: tableName,
    KeyConditionExpression:
      '#pk = :primary_key and begins_with(#sk, :drop_prefix)',
    ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
    ExpressionAttributeValues: {
      ':primary_key': `USER#${params.publicAddress}`,
      ':drop_prefix': '#DROP#',
    },
  }
  console.log({ queryParams })
  return documentClient
    .query(queryParams)
    .promise()
    .then((data) => data.Items)
}

export interface CreateContentParams {
  dropId: string
  contentId: string
  tokenId: string // TODO GSI
  creator: string
  metadata: {[key: string]: any}
  key: string
}
// Create content entry
export const createContent = async (params: CreateContentParams) => {
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#CONTENT#${params.contentId}`,
    },
    UpdateExpression: 'set #CA = :ca, #TI = :ti, #C = :c, #K = :k, #M = :m',
    ExpressionAttributeNames: {
      '#CA': 'CreatedAt',
      '#TI': 'TokenId',
      '#C': 'Creator',
      '#K': 'S3ObjectKey',
      '#M': 'Metadata',
    },
    ExpressionAttributeValues: {
      ':ca': new Date().toISOString(),
      ':ti': params.tokenId,
      ':c': params.creator,
      ':k': params.key,
      ':m': params.metadata
    },
  }

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)
}

export const getContent = (params: { dropId: string, contentId: string }) => {
  const queryParams: DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#CONTENT#${params.contentId}`,
    },
    ProjectionExpression: 'Creator, S3ObjectKey, Metadata, TokenId',
  }
  console.log({ queryParams })
  return documentClient
    .get(queryParams)
    .promise()
    .then((data) => data.Item)
}

interface AddTokenDataToContentParams {
  dropId: string,
  contentId: string,
  tokenMetadata: string,
  tokenUri: string,
}

export const addTokenDataToContent = async (params: AddTokenDataToContentParams) => {
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#CONTENT#${params.contentId}`,
    },
    UpdateExpression: 'set #UA = :ua, #TM = :tm, #TU = :tu',
    ExpressionAttributeNames: {
      '#UA': 'UpdatedAt',
      '#TM': 'TokenMetadata',
      '#TU': 'TokenUri',
    },
    ExpressionAttributeValues: {
      ':ua': new Date().toISOString(),
      ':tm': params.tokenMetadata,
      ':tu': params.tokenUri,
    },
  }

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)
}

export const getTokenForMinting = (params: { dropId: string, contentId: string }) => {
  const queryParams: DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#CONTENT#${params.contentId}`,
    },
    ProjectionExpression: 'Creator, TokenId, TokenUri',
  }
  console.log({ queryParams })
  return documentClient
    .get(queryParams)
    .promise()
    .then((data) => data.Item)
}