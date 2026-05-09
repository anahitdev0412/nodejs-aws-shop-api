import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { Logger, successResponse, internalErrorResponse, notFoundResponse, validationErrorResponse,  ErrorCodes, findProductById  } from "@products-api/shared";  

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
    log.info("Looking up product", { productId });
    const product = findProductById(productId);

    if (!product) {
      log.warn("Product not found", { productId });
      return notFoundResponse(
        `Product with ID '${productId}' was not found`,
        ErrorCodes.PRODUCT_NOT_FOUND
      );
    }

    log.info("Product found", { productId, productName: product.productName });

    return successResponse(product, {
      requestId: context.awsRequestId,
    });
  } catch (error) {
    log.error("Unexpected error while fetching product by ID", { error });
    return internalErrorResponse(context.awsRequestId);
  }
};
