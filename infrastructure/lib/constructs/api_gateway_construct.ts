import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AccessLogFormat } from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface RouteDefinition {
  path: string;
  method: apigwv2.HttpMethod;
  fn: lambda.Function;
  integrationId: string;
}

export interface ApiGatewayConstructProps {
  envName: string;
  routes: RouteDefinition[];  // ← all routes from all services
}

/**
 * HTTP API Gateway (v2) with:
 * - Access logging
 * - CORS enabled
 * - Throttling
 * - Staged deployments
 */

export class ApiGatewayConstruct extends Construct {
  public readonly api: apigwv2.HttpApi;
  //public readonly apiEndpoint: string;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    // Access Log Group
    const accessLogGroup = new logs.LogGroup(this, "ApiAccessLogs", {
      logGroupName: `/aws/apigateway/rsschool-shop-api-${props.envName}`,
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
      }
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

    props.routes.forEach((route) => {
      this.api.addRoutes({
        path: route.path,
        methods: [route.method],
        integration: new apigwv2Integrations.HttpLambdaIntegration(
          route.integrationId,
          route.fn
        ),
      });
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

    new cdk.CfnOutput(this, "SwaggerUiEndpoint", {
      value: `${apiUrl}swagger`,
      description: "Swagger UI endpoint",
    });
  }

  public addRoutes(routes: RouteDefinition[]): void {
    routes.forEach((route) => {
      this.api.addRoutes({
        path: route.path,
        methods: [route.method],
        integration: new apigwv2Integrations.HttpLambdaIntegration(
          route.integrationId,
          route.fn
        ),
      });
    });
  }
}
