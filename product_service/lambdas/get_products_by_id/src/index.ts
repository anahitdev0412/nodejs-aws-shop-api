import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { Logger, successResponse, internalErrorResponse, notFoundResponse, validationErrorResponse,  ErrorCodes, docClient, Product, Stock, ProductWithStock  } from "@products-api/shared";
import { GetCommand } from "@aws-sdk/lib-dynamodb";  

const logger = new Logger("get-product-by-id");

/**
 * GET /products/{productId}
 * Returns a single product matching the given ID.
 */

export const handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  const log = logger.withRequestId(context.awsRequestId);

  log.info("Received request", {
    path: event.rawPath,
    method: event.requestContext.http.method,
    pathParameters: event.pathParameters,
  });

  try {
    const productId = event.pathParameters?.productId;

    // Validation
    if (!productId) {
      log.warn("Missing productId path/query parameter");
      return validationErrorResponse("productId path/query parameter is required");
    }

    // Lookup product by ID
    const [productResult, stockResult] = await Promise.all([
      docClient.send(new GetCommand({
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Key: { id: productId },
      })),
      docClient.send(new GetCommand({
        TableName: process.env.STOCKS_TABLE_NAME,
        Key: { product_id: productId },
      })),
    ]);

    if (!productResult.Item) {
      log.warn("Product not found", { productId });
      return notFoundResponse(
        `Product with ID '${productId}' was not found`,
        ErrorCodes.PRODUCT_NOT_FOUND
      );
    }

    const product = productResult.Item as Product;
    const stock   = stockResult.Item as Stock | undefined;

    const result: ProductWithStock = {
      ...product,
      count: stock?.count ?? 0,
    };

    log.info("Product found", { productId, title: product.title });

    return successResponse(result, {
      requestId: context.awsRequestId,
    });
  } catch (error) {
    log.error("Unexpected error while fetching product by ID", { error });
    return internalErrorResponse(context.awsRequestId);
  }
};
