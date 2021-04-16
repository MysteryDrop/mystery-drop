import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as mime from 'mime-types'
import { addContentToDrop, AddContentToDropParams, createContent, createDrop, CreateDropParams } from '../models/mysteryDropFunctions'
import { uuid } from 'uuidv4'

interface ContentMetadata {
  contentId: string // this has to come from the client so they know which url to use for which piece
  contentType: string
  contentTitle: string
  contentDescription: string
}

export interface DropMetadata {
  contentType: string
  dropTitle: string
  dropDescription: string
  content: ContentMetadata[]
  numberOfItems: number
}

export interface InitiateUploadContentResponse {
  contentId: string
  url: string
}

export interface InitiateUploadResponse {
  dropId: string
  user: string
  dropPreviewContentId: string
  dropPreviewUrl: string
  content: InitiateUploadContentResponse[]
}

interface PrepareS3ForUploadParams extends DropMetadata {
  user: string
}

const getDropPreviewPutCommand = (params: {
  dropId: string
  dropTitle: string
  dropDescription: string
  numberOfItems: string
  contentType: string
  dropPreviewContentId: string
  user: string
}) => {
  const dropPreviewCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `uploads/drop_${params.dropId}/${
      params.dropPreviewContentId
    }.${mime.extension(params.contentType)!}`,
    ContentType: params.contentType,
    Metadata: {
      type: 'PREVIEW',
      dropTitle: params.dropTitle,
      dropDescription: params.dropDescription,
      numberOfItems: params.numberOfItems,
      dropPreviewContentId: params.dropPreviewContentId,
      contentType: params.contentType,
      dropId: params.dropId,
      user: params.user,
    },
  })

  return dropPreviewCommand
}

const getContentPutCommand = (params: {
  content: ContentMetadata
  dropId: string
  user: string
}) => {
  const content = params.content
  return new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `uploads/drop_${params.dropId}/${content.contentId}.${mime.extension(
      content.contentType
    )!}`,
    ContentType: content.contentType,
    Metadata: {
      type: 'CONTENT',
      contentTitle: content.contentTitle,
      contentDescription: content.contentDescription,
      contentId: content.contentId,
      contentType: content.contentType,
      dropId: params.dropId,
      user: params.user,
    },
  })
}

export const prepareS3ForUpload = async (params: PrepareS3ForUploadParams, client: S3Client) => {
  const dropId = uuid()
  const dropPreviewContentId = uuid()

  const dropPreviewCommand = getDropPreviewPutCommand({
    dropId,
    dropTitle: params.dropTitle,
    dropDescription: params.dropDescription,
    numberOfItems: params.numberOfItems.toString(),
    contentType: params.contentType,
    dropPreviewContentId,
    user: params.user,
  })

  const dropPreviewUrl = await getSignedUrl(client, dropPreviewCommand, {
    expiresIn: 3600,
  })

  const contents: InitiateUploadContentResponse[] = []

  for (let index = 0; index < params.content.length; index++) {
    const content = params.content[index]
    const contentPutCommand = getContentPutCommand({
      content,
      user: params.user,
      dropId
    })
    const contentPutUrl = await getSignedUrl(
      client,
      contentPutCommand,
      { expiresIn: 3600 }
    )
    contents.push({
      contentId: content.contentId,
      url: contentPutUrl,
    })
  }

  const result: InitiateUploadResponse = {
    dropId,
    user: params.user,
    dropPreviewContentId,
    dropPreviewUrl,
    content: contents,
  }

  return result
}

interface S3EventRecordS3 {
        s3SchemaVersion: string;
        configurationId: string;
        bucket: {
            name: string;
            ownerIdentity: {
                principalId: string;
            };
            arn: string;
        };
        object: {
            key: string;
            size: number;
            eTag: string;
            versionId?: string;
            sequencer: string;
        };
}

export const processUploadedContent = async (s3Record: S3EventRecordS3, client: S3Client) => {
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
      key: s3Record.object.key,
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
      key: s3Record.object.key,
    }

    await addContentToDrop(contentDetails)

    const contentMetadata = {
      title: contentDetails.title,
      description: contentDetails.description,
      contentType: contentDetails.contentType,
    }

    await createContent({
      dropId: contentDetails.dropId,
      contentId: contentDetails.id,
      creator: contentDetails.user,
      metadata: contentMetadata,
      key: contentDetails.key,
    })
  } else {
    throw new Error('Missing metadata type')
  }

}