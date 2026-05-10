import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  docClient,
  Logger,
  successResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@products-api/shared";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";  

const logger = new Logger("create-product");

/**
 * POST /products
 * Creates a new product.
 */

interface CreateProductBody {
  title: string;
  description?: string;
  price: number;
  count: number;
}

export const handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  const log = logger.withRequestId(context.awsRequestId);

  log.info("Received request", {
    path: event.rawPath,
    method: event.requestContext.http.method,
    pathParameters: event.pathParameters,
  });

  try {
    let parsedBody: unknown;
 
    try {
      parsedBody = JSON.parse(event.body ?? "") as CreateProductBody;
    } catch {
      return validationErrorResponse("Request body must be valid JSON");
    }

    const productId = uuidv4();
 
    const product = {
      id: productId,
      title: (parsedBody as CreateProductBody).title,
      description: (parsedBody as CreateProductBody).description ?? "",
      price: (parsedBody as CreateProductBody).price,
    };
 
    const stock = {
      product_id: productId,
      count: (parsedBody as CreateProductBody).count,
    };
 
    log.info("Creating product with stock", { productId, title: product.title });

    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: process.env.PRODUCTS_TABLE_NAME,
              Item: product,
              // Prevent overwriting if product with same id already exists
              ConditionExpression: "attribute_not_exists(id)",
            },
          },
          {
            Put: {
              TableName: process.env.STOCKS_TABLE_NAME,
              Item: stock,
              ConditionExpression: "attribute_not_exists(product_id)",
            },
          },
        ],
      })
    );
 
    log.info("Product created successfully", { productId });

    return successResponse(
      { product, stock },
      { requestId: context.awsRequestId },
      201  // Created
    );






    // const productId = event.pathParameters?.productId;

    // // Validation
    // if (!productId) {
    //   log.warn("Missing productId path/query parameter");
    //   return validationErrorResponse("productId path/query parameter is required");
    // }

    // // Lookup product by ID
    // const [productResult, stockResult] = await Promise.all([
    //   docClient.send(new GetCommand({
    //     TableName: process.env.PRODUCTS_TABLE_NAME,
    //     Key: { id: productId },
    //   })),
    //   docClient.send(new GetCommand({
    //     TableName: process.env.STOCKS_TABLE_NAME,
    //     Key: { product_id: productId },
    //   })),
    // ]);

    // if (!productResult.Item) {
    //   log.warn("Product not found", { productId });
    //   return notFoundResponse(
    //     `Product with ID '${productId}' was not found`,
    //     ErrorCodes.PRODUCT_NOT_FOUND
    //   );
    // }

    // const product = productResult.Item as Product;
    // const stock   = stockResult.Item as Stock | undefined;

    // const result: ProductWithStock = {
    //   ...product,
    //   count: stock?.count ?? 0,
    // };

    // log.info("Product found", { productId, title: product.title });

    // return successResponse(result, {
    //   requestId: context.awsRequestId,
    // });
  } catch (error) {
    log.error("Unexpected error while fetching product by ID", { error });
    return internalErrorResponse(context.awsRequestId);
  }
};
