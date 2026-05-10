import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { LambdaConstruct } from "./lambda_construct";
import { ApiGatewayConstruct } from "./api_gateway_construct";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";

const MONOREPO_ROOT = path.resolve(__dirname, "../../../");

export interface SwaggerConstructProps {
  envName: string;
  enableTracing: boolean;
}

export class SwaggerConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    gateway: ApiGatewayConstruct,
    props: SwaggerConstructProps
  ) {
    super(scope, id);

    // ── Create swagger lambda ─────────────────────────────────────────────────
    // gateway.apiEndpoint is already available because gateway was
    // created before this construct in products_api_stack.ts
    
    const getSwagger = new LambdaConstruct(this, "GetSwagger", {
      envName: props.envName,
      enableTracing: false,
      functionName: "getSwagger",
      entry: path.join(
        MONOREPO_ROOT,
        "swagger_service/lambdas/get_swagger/src/index.ts",
      ),
      description: "Serves Swagger UI",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "swagger_service/lambdas/get_swagger"
      ),
    });

    // Register swagger routes on the shared gateway 
    gateway.addRoutes([
      {
        path: "/swagger",
        method: apigwv2.HttpMethod.GET,
        fn: getSwagger.lambdaFunction,
        integrationId: "GetSwaggerIntegration",
      },
      {
        path: "/swagger/swagger.json",
        method: apigwv2.HttpMethod.GET,
        fn: getSwagger.lambdaFunction,
        integrationId: "GetSwaggerJsonIntegration",
      },
    ]);
  }
}
