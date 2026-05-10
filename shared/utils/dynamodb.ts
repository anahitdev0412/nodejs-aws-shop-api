import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-west-1",
});
export const docClient = DynamoDBDocumentClient.from(dynamoDbClient);