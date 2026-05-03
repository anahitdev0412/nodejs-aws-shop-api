import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { findProductById } from "../../../../shared/data/products";
import { Logger } from "../../../../shared/utils/logger";
import { successResponse, internalErrorResponse } from "../../../../shared/utils/http";
import { notFoundResponse } from "../../../../shared/utils/http";
import { validationErrorResponse } from "../../../../shared/utils/http";
import { ErrorCodes } from "../../../../shared/types/error_codes";    

const logger = new Logger("get-product-by-id");

/**
 * GET /products/{productId}
 * Returns a single product matching the given ID.
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const log = logger.withRequestId(context.awsRequestId);

  log.info("Received request", {
    path: event.path,
    method: event.httpMethod,
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
