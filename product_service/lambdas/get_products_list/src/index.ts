import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { PRODUCTS } from "../../../../shared/data/products";
import { Logger } from "../../../../shared/utils/logger";
import { successResponse, internalErrorResponse } from "../../../../shared/utils/http";

const logger = new Logger("get-products-list");

/**
 * GET /products
 * Returns a list of all available products.
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const log = logger.withRequestId(context.awsRequestId);

  log.info("Received request", {
    path: event.path,
    method: event.httpMethod,
    queryStringParameters: event.queryStringParameters,
  });

  try {
    // Optional: support basic query filtering by category
    const { category } = event.queryStringParameters ?? {};

    let products = PRODUCTS;

    if (category) {
      products = PRODUCTS.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
      log.info(`Filtering by category: ${category}`, { count: products.length });
    }

    log.info("Returning products list", { count: products.length });

    return successResponse(products, {
      total: products.length,
      requestId: context.awsRequestId,
    });
  } catch (error) {
    log.error("Unexpected error while fetching products list", { error });
    return internalErrorResponse(context.awsRequestId);
  }
};
