import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
/**
  * Returns an IAM policy document for a given user and resource.
  *
  * @method buildIAMPolicy
  * @param {String} userId - user id
  * @param {String} effect  - Allow / Deny
  * @param {String} resource - resource ARN
  * @param {String} context - response context
  * @returns {Object} policyDocument
  */
export const buildIAMPolicy = (userId, effect, resource, context) => {
  const policy = {
    principalId: userId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };

  return policy;
};

export const getS3Object = async (
  s3Key: string,
  bucketName: string,
  client: S3Client
) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  })
  const s3Object = await client.send(getObjectCommand)
  if (!s3Object.$metadata) {
    const errorMessage = 'Cannot process content as no metadata is set for it'
    console.error(errorMessage, { s3Object })
    throw new Error(errorMessage)
  }

  const content = s3Object.Body

  return content
}