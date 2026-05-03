import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as path from "path";

export interface ProductsLambdaProps {
  functionName: string;
  lambdaPackagePath: string;
  entry: string;
  description: string;
  enableTracing: boolean;
  /** Environment variables */
  environment?: Record<string, string>;
  /** Environment name (dev/staging/prod) */
  envName: string;
}

const MONOREPO_ROOT = path.join(__dirname, "../../../");

export class ProductsLambda extends Construct {
  public readonly lambdaFunction: lambda.Function;
  public readonly logGroup: logs.LogGroup;

  constructor(scope: Construct, id: string, props: ProductsLambdaProps) {
    super(scope, id);

    // IAM Role
    const role = new iam.Role(this, "ExecutionRole", {
      roleName: `${props.functionName}-${props.envName}-role`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      description: `Execution role for ${props.functionName}`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        // Add AWSXRayDaemonWriteAccess only when tracing is enabled
        ...(props.enableTracing
          ? [
              iam.ManagedPolicy.fromAwsManagedPolicyName(
                "AWSXRayDaemonWriteAccess"
              ),
            ]
          : []),
      ],
    });

    // CloudWatch Log Group
    this.logGroup = new logs.LogGroup(this, "LogGroup", {
      logGroupName: `/aws/lambda/${props.functionName}-${props.envName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Function
    this.lambdaFunction = new NodejsFunction(this, "Function", {
      functionName: `${props.functionName}-${props.envName}`,
      description: props.description,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: props.entry,
      projectRoot: MONOREPO_ROOT,
      depsLockFilePath: path.join(MONOREPO_ROOT, "package-lock.json"),
      role,
      logGroup: this.logGroup,
      tracing: props.enableTracing
        ? lambda.Tracing.ACTIVE
        : lambda.Tracing.DISABLED,
      bundling: {
        externalModules: [],
        minify: false,
        sourceMap: true,
        target: "node22",
        esbuildArgs: {
          "--tree-shaking": "true",
        },
      },
      environment: {
        NODE_ENV: props.envName,
        POWERTOOLS_SERVICE_NAME: props.functionName,
        LOG_LEVEL: props.envName === "prod" ? "INFO" : "DEBUG",
        ...props.environment,
      }
    });

    // Output Lambda ARN
    new cdk.CfnOutput(this, "FunctionArn", {
      value: this.lambdaFunction.functionArn,
      description: `ARN for ${props.functionName}`,
      exportName: `${props.functionName}-${props.envName}-arn`,
    });
  }
}
