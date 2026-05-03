import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AccessLogFormat } from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface ProductsApiGatewayProps {
  envName: string;
  getProductsListFn: lambda.Function;
  getProductByIdFn: lambda.Function;
}

/**
 * HTTP API Gateway (v2) with:
 * - Access logging
 * - CORS enabled
 * - Throttling
 * - Staged deployments
 */

export class ProductsApiGateway extends Construct {
  public readonly api: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ProductsApiGatewayProps) {
    super(scope, id);

    // Access Log Group
    const accessLogGroup = new logs.LogGroup(this, "ApiAccessLogs", {
      logGroupName: `/aws/apigateway/products-api-${props.envName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // HTTP API
    this.api = new apigwv2.HttpApi(this, "HttpApi", {
      apiName: `products-api-${props.envName}`,
      description: `Products HTTP API (${props.envName})`,

      // CORS — handled natively by HTTP API (no preflight Lambda needed)
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.OPTIONS],
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        maxAge: cdk.Duration.days(1),
      },
      createDefaultStage: false,
    });

    // Stage
    new apigwv2.HttpStage(this, "Stage", {
      httpApi: this.api,
      stageName: props.envName,
      autoDeploy: true,
      accessLogSettings: {
        destination: new apigwv2.LogGroupLogDestination(accessLogGroup),
        format: AccessLogFormat.jsonWithStandardFields(),
      },
      throttle: {
        burstLimit: 50,
        rateLimit: 100,
      },
    });

    // Lambda Integrations
    const getProductsListIntegration =
      new apigwv2Integrations.HttpLambdaIntegration(
        "GetProductsListIntegration",
        props.getProductsListFn
      );

    const getProductByIdIntegration =
      new apigwv2Integrations.HttpLambdaIntegration(
        "GetProductByIdIntegration",
        props.getProductByIdFn
      );

    // GET /products → getProductsList
    this.api.addRoutes({
      path: "/products",
      methods: [apigwv2.HttpMethod.GET],
      integration: getProductsListIntegration,
    });

    // GET /products/{productId} → getProductById
    this.api.addRoutes({
      path: "/products/{productId}",
      methods: [apigwv2.HttpMethod.GET],
      integration: getProductByIdIntegration,
    });

    // Outputs
    const apiUrl = `${this.api.apiEndpoint}/${props.envName}/`;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: apiUrl,
      description: "Products API base URL",
      exportName: `products-api-url-${props.envName}`,
    });

    new cdk.CfnOutput(this, "ApiId", {
      value: this.api.apiId,
      description: "Products HTTP API Gateway ID",
    });

    new cdk.CfnOutput(this, "ProductsListEndpoint", {
      value: `${apiUrl}products`,
      description: "GET /products endpoint",
    });

    new cdk.CfnOutput(this, "ProductByIdEndpoint", {
      value: `${apiUrl}products/{productId}`,
      description: "GET /products/{productId} endpoint",
    });
  }
}
