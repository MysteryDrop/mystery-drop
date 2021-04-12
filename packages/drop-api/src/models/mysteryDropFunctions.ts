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

// Update drop
