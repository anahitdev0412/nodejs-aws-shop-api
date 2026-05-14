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
import * as yup from "yup";

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

// Yup validation schema for request body
 
const createProductSchema = yup.object({
  title: yup
    .string()
    .required("title is required")
    .trim()
    .min(1, "title must not be empty"),
 
  description: yup
    .string()
    .optional()
    .default(""),
 
  price: yup
    .number()
    .strict()
    .required("price is required")
    .positive("price must be a positive integer")
    .typeError("price must be a number"),
 
  count: yup
    .number()
    .strict()
    .required("count is required")
    .integer("count must be an integer")
    .min(0, "count must be a non-negative integer")
    .typeError("count must be a number"),
});

type CreateProductInput = yup.InferType<typeof createProductSchema>;

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

    // Validate with Yup schema and strip unknown fields
    let data: CreateProductInput;
 
    try {
      // abortEarly: false collects all errors instead of stopping at first
      data = await createProductSchema.validate(parsedBody, {
        abortEarly: false,
        stripUnknown: true,  // removes extra fields not in schema
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        log.warn("Validation failed", { errors: error.errors });
        return validationErrorResponse("Validation failed", {
          errors: error.errors,
        });
      }
      throw error;
    }

    const productId = uuidv4();
 
    const product = {
      id: productId,
      title: data.title,
      description: data.description ?? "",
      price: data.price,
    };
 
    const stock = {
      product_id: productId,
      count: data.count,
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
  } catch (error) {
    log.error("Unexpected error while fetching product by ID", { error });
    if (
      error instanceof Error &&
      error.name === "TransactionCanceledException"
    ) {
      log.warn("Transaction cancelled", { error });
      return validationErrorResponse("Product could not be created due to a conflict");
    }
 
    log.error("Unexpected error while creating product", { error });
    return internalErrorResponse(context.awsRequestId);
  }
};
