import { CfnOutput, StackProps } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sst from "@serverless-stack/resources";

export default class DynamoDBStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: StackProps) {
    super(scope, id, props);

    // const app = this.node.root;

    const table = new dynamodb.Table(this, "Table", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      partitionKey: { name: "PublicAddress", type: dynamodb.AttributeType.STRING },
    });

    // Output values
    new CfnOutput(this, "TableName", {
      value: table.tableName,
      exportName: scope.logicalPrefixedName("TableName")
    });
    new CfnOutput(this, "TableArn", {
      value: table.tableArn,
      exportName: scope.logicalPrefixedName("TableArn")
    });
  }
}