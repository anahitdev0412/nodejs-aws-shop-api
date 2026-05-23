import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";
import { LambdaConstruct } from "./constructs/lambda_construct";
import { S3Construct } from "./constructs/s3_construct";
import { ApiGatewayConstruct } from "./constructs/api_gateway_construct";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";

const MONOREPO_ROOT = path.resolve(__dirname, "../../");

export class ImportProductStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for CSV uploads
    const s3BucketforCSV = new S3Construct(this, "S3CSV", {
      envName: this.node.tryGetContext("env") || "dev",
    });

  }
}