import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Notifications from "aws-cdk-lib/aws-s3-notifications";
import { LambdaConstruct } from "./constructs/lambda_construct";
import { S3Construct } from "./constructs/s3_construct";
import { ApiGatewayConstruct } from "./constructs/api_gateway_construct";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";

export interface ImportApiStackProps extends cdk.StackProps {
  envName: string;
  enableTracing?: boolean;
}

const MONOREPO_ROOT = path.resolve(__dirname, "../../");

export class ImportProductStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImportApiStackProps) {
    super(scope, id, props);

    const { envName, enableTracing = false } = props;

    const sharedLambdaProps = { envName, enableTracing };

    // S3 Bucket for CSV uploads
    const s3BucketforCSV = new S3Construct(this, "S3CSV", {
      envName: this.node.tryGetContext("env") || "dev",
    });

    const importProductsFile = new LambdaConstruct(this, "ImportProductsFile", {
      ...sharedLambdaProps,
      functionName: "importProductsFile",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "import_service/lambdas/import_products_file"
      ),
      entry: path.join(
        MONOREPO_ROOT,
        "import_service/lambdas/import_products_file/src/index.ts",
      ),
      description: "Generates presigned S3 URL for CSV upload (GET /import)",
      environment: {
        BUCKET_NAME: s3BucketforCSV.bucket.bucketName,
        UPLOADED_FOLDER: "uploaded",
      },
    });

       // importFileParser — triggered by S3 event, parses uploaded CSV
    const importFileParser = new LambdaConstruct(this, "ImportFileParser", {
      ...sharedLambdaProps,
      functionName: "importFileParser",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "import_service/lambdas/import_file_parser"
      ),
      entry: path.join(
        MONOREPO_ROOT,
        "import_service/lambdas/import_file_parser/src/index.ts"
      ),
      description: "Parses uploaded CSV file from S3",
      environment: {
        BUCKET_NAME: s3BucketforCSV.bucket.bucketName,
        UPLOADED_FOLDER: "uploaded",
        PARSED_FOLDER: "parsed",
      }
    });

    s3BucketforCSV.bucket.grantReadWrite(importProductsFile.lambdaFunction);

    s3BucketforCSV.bucket.grantReadWrite(importFileParser.lambdaFunction);
    s3BucketforCSV.bucket.grantDelete(importFileParser.lambdaFunction);

    // Automatically invoke importFileParser when a file lands in uploaded/
    s3BucketforCSV.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(importFileParser.lambdaFunction),
      { prefix: "uploaded/" }
    );

    const gateway = new ApiGatewayConstruct(this, "ImportApiGateway", {
      envName,
      apiName: "import-api",
      routes: [
        {
          path: "/import",
          method: apigwv2.HttpMethod.GET,
          fn: importProductsFile.lambdaFunction,
          integrationId: "ImportProductsFileIntegration",
        },
      ],
    });

    new cdk.CfnOutput(this, "ImportBucketName", {
      value: s3BucketforCSV.bucket.bucketName,
      description: "Import S3 bucket name",
    });

    new cdk.CfnOutput(this, "ImportApiUrl", {
      value: gateway.api.apiEndpoint,
      description: "Import API URL",
    });
  }
}
