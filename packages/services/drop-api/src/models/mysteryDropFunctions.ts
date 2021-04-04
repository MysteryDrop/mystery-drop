import { DynamoDB } from "aws-sdk"
import {
  Decorator,
  Query,
  Table,
} from "@serverless-seoul/dynamorm"

const client = new DynamoDB()
const documentClient = new DynamoDB.DocumentClient({ service: client })

@Decorator.Table({ name: process.env.DYNAMODB_TABLE, connection: { documentClient, client}})
export class MysteryDrop extends Table {
  @Decorator.HashPrimaryKey("PublicAddress")
  public static readonly primaryKey: Query.HashPrimaryKey<MysteryDrop, string>;

  @Decorator.Attribute({ name: "PublicAddress" })
  public PublicAddress: string;

  @Decorator.Attribute({ name: "Nonce" })
  public Nonce: string;

  @Decorator.Attribute({ name: "CreatedAt" })
  public CreatedAt: string;
}