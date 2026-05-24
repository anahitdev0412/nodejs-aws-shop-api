import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";
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

    s3BucketforCSV.bucket.grantReadWrite(importProductsFile.lambdaFunction);

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
  }
}
