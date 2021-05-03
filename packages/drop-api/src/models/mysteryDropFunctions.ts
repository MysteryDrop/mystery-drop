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
export const getAuthenticatedDropsView = (params: {
  publicAddress: string
  dropId?: string
}) => {
  const queryParams: DynamoDB.DocumentClient.QueryInput = params.dropId
    ? {
        TableName: tableName,
        KeyConditionExpression:
          '#pk = :primary_key and #sk = :sort_key',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':primary_key': `USER#${params.publicAddress}`,
          ':sort_key': `#DROP#${params.dropId}`,
        },
      }
    : {
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

export const updateDropStatus = (params: {
  dropId: string,
  dropData: string,
  status: string
}) => {
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#STATUS#${params.status}`,
    },
    UpdateExpression: 'set #DD = :d, #CA = :c',
    ExpressionAttributeNames: { '#DD': 'DropData', '#CA': 'CreatedAt' },
    ExpressionAttributeValues: {
      ':d': params.dropData,
      ':c': new Date().toISOString(),
    },
  }
  console.log({queryParams})

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)
}

export const getDropStatus = (params: {dropId: string}) => {
  const queryParams: DynamoDB.DocumentClient.QueryInput = 
    {
        TableName: tableName,
        KeyConditionExpression:
          '#pk = :primary_key and begins_with(#sk, :sort_key)',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':primary_key': `DROP#${params.dropId}`,
          ':sort_key': `#STATUS#`
        },
      }
  console.log({ queryParams })
  return documentClient
    .query(queryParams)
    .promise()
    .then((data) => data.Items.length > 0 ? data.Items[0].SK.split('#STATUS#')[1] : undefined)

}

// Get drop
export const getPublicDropsView = (params: {
  dropId?: string
}) => {
  const queryParams: DynamoDB.DocumentClient.QueryInput = params.dropId
    ? {
        TableName: tableName,
        KeyConditionExpression:
          '#pk = :primary_key and #sk = :sort_key',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':primary_key': `DROP#${params.dropId}`,
          ':sort_key': '#STATUS#LISTED',
        },
      }
    : {
        TableName: tableName,
        IndexName: 'SK_GSI_PK',
        KeyConditionExpression:
          '#sk = :sort_key and begins_with(#pk, :pk_prefix)',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':pk_prefix': `DROP#`,
          ':sort_key': '#STATUS#LISTED'
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
  creator: string
  metadata: { [key: string]: any }
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
    UpdateExpression: 'set #CA = :ca, #UA = :ua, #C = :c, #K = :k, #M = :m, #ST = :st',
    ExpressionAttributeNames: {
      '#CA': 'CreatedAt',
      '#UA': 'UpdatedAt',
      '#C': 'Creator',
      '#K': 'S3ObjectKey',
      '#M': 'Metadata',
      '#ST': 'Status',
    },
    ExpressionAttributeValues: {
      ':ca': new Date().toISOString(),
      ':ua': new Date().toISOString(),
      ':c': params.creator,
      ':k': params.key,
      ':m': params.metadata,
      ':st': 'PROCESSED',
    },
  }

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)
}

// Get drop
export const getContent = (params: {
  dropId: string
  contentId?: string
}) => {
  const queryParams: DynamoDB.DocumentClient.QueryInput = params.contentId
    ? {
        TableName: tableName,
        KeyConditionExpression:
          '#pk = :primary_key and #sk = :sort_key',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':primary_key': `DROP#${params.dropId}`,
          ':sort_key': `#CONTENT#${params.contentId}`,
        },
      }
    : {
        TableName: tableName,
        KeyConditionExpression:
          '#pk = :primary_key and begins_with(#sk, :content_prefix)',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
          ':primary_key': `DROP#${params.dropId}`,
          ':content_prefix': '#CONTENT#',
        },
      }
  console.log({ queryParams })
  return documentClient
    .query(queryParams)
    .promise()
    .then((data) => data.Items)
}


interface AddTokenDataToContentParams {
  dropId: string
  tokenId: string
  contentId: string
  tokenMetadata: string
  tokenUri: string
}

export const addTokenDataToContent = async (
  params: AddTokenDataToContentParams
) => {
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#CONTENT#${params.contentId}`,
    },
    UpdateExpression: 'set #UA = :ua, #TM = :tm, #TU = :tu, #TI = :ti, #ST = :st',
    ExpressionAttributeNames: {
      '#UA': 'UpdatedAt',
      '#TM': 'TokenMetadata',
      '#TI': 'TokenId',
      '#TU': 'TokenUri',
      '#ST': 'Status',
    },
    ExpressionAttributeValues: {
      ':ua': new Date().toISOString(),
      ':tm': params.tokenMetadata,
      ':ti': params.tokenId,
      ':tu': params.tokenUri,
      ':st': 'MINTABLE'
    },
  }

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)
}

export const getTokenForMinting = (params: {
  dropId: string
  contentId: string
}) => {
  const queryParams: DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#CONTENT#${params.contentId}`,
    },
    ProjectionExpression: 'Creator, TokenId, TokenUri, #ST',
    ExpressionAttributeNames: {
      '#ST': 'Status',
    },
  }
  console.log({ queryParams })
  return documentClient
    .get(queryParams)
    .promise()
    .then((data) => data.Item)
}

export const addMintDataToContent = (params: {
  dropId: string
  contentId: string
  tokenData: string
}) => {
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `DROP#${params.dropId}`,
      SK: `#CONTENT#${params.contentId}`,
    },
    UpdateExpression: 'set #UA = :ua, #TD = :td, #ST = :st',
    ExpressionAttributeNames: {
      '#UA': 'UpdatedAt',
      '#TD': 'TokenData',
      '#ST': 'Status',
    },
    ExpressionAttributeValues: {
      ':ua': new Date().toISOString(),
      ':td': params.tokenData,
      ':st': 'MINTED'
    },
  }

  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data)

}