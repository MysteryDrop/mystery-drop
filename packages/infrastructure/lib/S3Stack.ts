import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as sst from "@serverless-stack/resources";

export default class S3Stack extends sst.Stack {
  // Public reference to the S3 bucket
  bucket: s3.Bucket;

  constructor(scope: sst.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "CreatorDrop", {
      accessControl: s3.BucketAccessControl.PRIVATE,
    });

    this.bucket.addCorsRule({
      allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
      allowedOrigins: ['http://localhost:3000', 'https://mysterydrop.app', 'https://dev.mysterydrop.app'],
      allowedHeaders: ['*']
    });

    // Export values
    new cdk.CfnOutput(this, "CreatorDropBucketName", {
      value: this.bucket.bucketName,
      exportName: scope.logicalPrefixedName("CreatorDropBucketName")
    });
  }
}