import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { Logger, successResponse, internalErrorResponse, Product, Stock, ProductWithStock, docClient  } from "@products-api/shared";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const logger = new Logger("get-products-list");

/**
 * GET /products
 * Returns a list of all available products.
 */
export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const log = logger.withRequestId(context.awsRequestId);

  log.info("Received request", {
    path: event.rawPath,
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
  });

  try {
    const [productsResult, stocksResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: process.env.PRODUCTS_TABLE_NAME })),
      docClient.send(new ScanCommand({ TableName: process.env.STOCKS_TABLE_NAME })),
    ]);

    const products = (productsResult.Items ?? []) as Product[];
    const stocks   = (stocksResult.Items   ?? []) as Stock[];

    // Join products with stock count
    const productsWithStock: ProductWithStock[] = products.map((product) => {
      const stock = stocks.find((s) => s.product_id === product.id);
      return {
        ...product,
        count: stock?.count ?? 0,
      };
    });

    return successResponse(productsWithStock, {
      total: productsWithStock.length,
      requestId: context.awsRequestId,
    });
  } catch (error) {
    log.error("Unexpected error while fetching products list", { error });
    return internalErrorResponse(context.awsRequestId);
  }
};
