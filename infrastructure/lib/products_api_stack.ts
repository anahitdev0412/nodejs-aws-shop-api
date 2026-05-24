import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { LambdaConstruct } from "./constructs/lambda_construct";
import { ApiGatewayConstruct } from "./constructs/api_gateway_construct";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { SwaggerConstruct } from "./constructs/swagger_construct";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

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


    // DynamoDB Tables
    const productsTable = new dynamodb.Table(this, "ProductsTable", {
      tableName: `products-${envName}`,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const stocksTable = new dynamodb.Table(this, "StocksTable", {
      tableName: `stocks-${envName}`,
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
    });

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
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      },
    });

    // Lambda: getProductById 
    const getProductById = new LambdaConstruct(this, "GetProductById", {
      ...sharedLambdaProps,
      functionName: "getProductById",
      entry: path.join(MONOREPO_ROOT, "product_service/lambdas/get_products_by_id/src/index.ts"),
      description: "Returns a single product by ID (GET /products/{productId})",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "product_service/lambdas/get_products_by_id"
      ),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      },
    });

        // Lambda: getProductById 
    const createProduct = new LambdaConstruct(this, "CreateProduct", {
      ...sharedLambdaProps,
      functionName: "createProduct",
      entry: path.join(MONOREPO_ROOT, "product_service/lambdas/create_product/src/index.ts"),
      description: "Creates a new product (POST /products)",
      lambdaPackagePath: path.join(
        MONOREPO_ROOT,
        "product_service/lambdas/create_product"
      ),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      },
    });

    //
    productsTable.grantReadData(getProductsList.lambdaFunction);
    productsTable.grantReadData(getProductById.lambdaFunction);
    stocksTable.grantReadData(getProductsList.lambdaFunction);
    stocksTable.grantReadData(getProductById.lambdaFunction);
    productsTable.grantWriteData(createProduct.lambdaFunction);
    stocksTable.grantWriteData(createProduct.lambdaFunction);
    
    const gateway = new ApiGatewayConstruct(this, "ProductsApiGateway", {
      envName,
      apiName: "products-api",
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
        {
          path: "/products",
          method: apigwv2.HttpMethod.POST,
          fn: createProduct.lambdaFunction,
          integrationId: "CreateProductIntegration",
        },
      ],
    });

    new SwaggerConstruct(this, "Swagger", gateway, {
      envName,
      enableTracing,
    });
  }
}

