import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { findProductById } from "../../../../shared/data/products";
import { Logger } from "../../../../shared/utils/logger";
import { successResponse, internalErrorResponse } from "../../../../shared/utils/http";
import { notFoundResponse } from "../../../../shared/utils/http";
import { validationErrorResponse } from "../../../../shared/utils/http";
import { ErrorCodes } from "../../../../shared/types/error_codes";    

const logger = new Logger("get-product-by-id");

// Product ID pattern: alphanumeric with dashes
const PRODUCT_ID_PATTERN = /^[a-zA-Z0-9-_]{1,64}$/;

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

    // ── Validation ───────────────────────────────────────────────────────────
    if (!productId) {
      log.warn("Missing productId path parameter");
      return validationErrorResponse("productId path parameter is required");
    }

    if (!PRODUCT_ID_PATTERN.test(productId)) {
      log.warn("Invalid productId format", { productId });
      return validationErrorResponse(
        "Invalid productId format. Must be alphanumeric with dashes (1-64 chars)",
        { productId }
      );
    }

    // ── Lookup ────────────────────────────────────────────────────────────────
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
