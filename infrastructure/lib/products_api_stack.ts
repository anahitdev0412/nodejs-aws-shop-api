import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { LambdaConstruct } from "./constructs/lambda_construct";
import { ApiGatewayConstruct } from "./constructs/api_gateway_construct";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { SwaggerConstruct } from "./constructs/swagger_construct";

export interface ProductsApiStackProps extends cdk.StackProps {
  envName: string;
  lambdaMemoryMB?: number;
  lambdaTimeoutSeconds?: number;
  logRetentionDays?: number;
  enableTracing?: boolean;
}

const MONOREPO_ROOT = path.resolve(__dirname, "../../");

export class ProductsApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProductsApiStackProps) {
    super(scope, id, props);

    const {
      envName,
      enableTracing = false,
    } = props;

    const sharedLambdaProps = {
      enableTracing,
      envName,
    };

    // Lambda: getProductsList
    const getProductsList = new LambdaConstruct(this, "GetProductsList", {
      ...sharedLambdaProps,
      functionName: "getProductsList",
      entry: path.join(MONOREPO_ROOT, "product_service/lambdas/get_products_list/src/index.ts"),
      description: "Returns a list of all products (GET /products)",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "product_service/lambdas/get_products_list"
      ),
    });

    //Lambda: getProductById 
    const getProductById = new LambdaConstruct(this, "GetProductById", {
      ...sharedLambdaProps,
      functionName: "getProductById",
      entry: path.join(MONOREPO_ROOT, "product_service/lambdas/get_products_by_id/src/index.ts"),
      description: "Returns a single product by ID (GET /products/{productId})",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "product_service/lambdas/get_products_by_id"
      ),
    });

    const gateway = new ApiGatewayConstruct(this, "ProductsApiGateway", {
      envName,
      routes: [
        // products service routes
        {
          path: "/products",
          method: apigwv2.HttpMethod.GET,
          fn: getProductsList.lambdaFunction,
          integrationId: "GetProductsListIntegration",
        },
        {
          path: "/products/{productId}",
          method: apigwv2.HttpMethod.GET,
          fn: getProductById.lambdaFunction,
          integrationId: "GetProductByIdIntegration",
        },
      ],
    });

    new SwaggerConstruct(this, "Swagger", gateway, {
      envName,
      enableTracing,
    });
  }
}

