import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { ProductsLambda } from "./constructs/products_lambda";
import { ProductsApiGateway } from "./constructs/products_api_gateway";

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
    const getProductsList = new ProductsLambda(this, "GetProductsList", {
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
    const getProductById = new ProductsLambda(this, "GetProductById", {
      ...sharedLambdaProps,
      functionName: "getProductById",
      entry: path.join(MONOREPO_ROOT, "product_service/lambdas/get_products_list/src/index.ts"),
      description: "Returns a single product by ID (GET /products/{productId})",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "product_service/lambdas/get_products_by_id"
      ),
    });

    // API Gateway
    new ProductsApiGateway(this, "ApiGateway", {
      envName,
      getProductsListFn: getProductsList.lambdaFunction,
      getProductByIdFn: getProductById.lambdaFunction,
    });
  }
}
