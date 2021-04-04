import * as sst from "@serverless-stack/resources";

import DynamoDBStack from "./DynamoDBStack";
import S3Stack from "./S3Stack";

export default function main(app: sst.App): void {
  new DynamoDBStack(app, "dynamodb");
  new S3Stack(app, "s3");
}
