import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { handler } from "../product_service/lambdas/get_products_by_id/src/index";

// Mock shared package
jest.mock("@products-api/shared", () => ({
  Logger: jest.fn().mockImplementation(() => ({
    withRequestId: jest.fn().mockReturnThis(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
  successResponse: jest.fn((data, meta) => ({
    statusCode: 200,
    body: JSON.stringify({ success: true, data, meta }),
  })),
  notFoundResponse: jest.fn((message, code) => ({
    statusCode: 404,
    body: JSON.stringify({ success: false, error: { message, code } }),
  })),
  validationErrorResponse: jest.fn((message) => ({
    statusCode: 400,
    body: JSON.stringify({ success: false, error: { message } }),
  })),
  internalErrorResponse: jest.fn(() => ({
    statusCode: 500,
    body: JSON.stringify({ success: false, error: { message: "Internal server error" } }),
  })),
  findProductById: jest.fn(),
  ErrorCodes: {
    PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  },
}));

import { findProductById, successResponse, notFoundResponse, validationErrorResponse, internalErrorResponse } from "@products-api/shared";

// Test helpers
const mockContext = {
  awsRequestId: "test-request-id-123",
} as Context;

const buildEvent = (productId?: string): APIGatewayProxyEventV2 =>
  ({
    rawPath: `/products/${productId ?? ""}`,
    requestContext: {
      http: { method: "GET" },
    },
    pathParameters: productId ? { productId } : undefined,
  } as unknown as APIGatewayProxyEventV2);

const mockProduct = {
  id: "prod-001",
  title: "Sony WH-1000XM5",
  description: "Noise cancelling headphones",
  price: 349.99,
};

// Tests
describe("getProductById handler", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Success
  describe("when product exists", () => {
    it("should return 200 with the product", async () => {
      (findProductById as jest.Mock).mockReturnValue(mockProduct);

      const result = await handler(buildEvent("prod-001"), mockContext);

      expect(result).toMatchObject({ statusCode: 200 });
      expect(findProductById).toHaveBeenCalledWith("prod-001");
      expect(successResponse).toHaveBeenCalledWith(mockProduct, {
        requestId: mockContext.awsRequestId,
      });
    });

    it("should call findProductById with the correct productId", async () => {
      (findProductById as jest.Mock).mockReturnValue(mockProduct);

      await handler(buildEvent("prod-001"), mockContext);

      expect(findProductById).toHaveBeenCalledTimes(1);
      expect(findProductById).toHaveBeenCalledWith("prod-001");
    });
  });

  // Not found
  describe("when product does not exist", () => {
    it("should return 404 when product is not found", async () => {
      (findProductById as jest.Mock).mockReturnValue(undefined);

      const result = await handler(buildEvent("non-existent-id"), mockContext);

      expect(result).toMatchObject({ statusCode: 404 });
      expect(notFoundResponse).toHaveBeenCalledWith(
        "Product with ID 'non-existent-id' was not found",
        "PRODUCT_NOT_FOUND"
      );
    });
  });

  // Validation
  describe("when productId is missing", () => {
    it("should return 400 when productId is not provided", async () => {
      const result = await handler(buildEvent(), mockContext);

      expect(result).toMatchObject({ statusCode: 400 });
      expect(validationErrorResponse).toHaveBeenCalledWith(
        "productId path/query parameter is required"
      );
      expect(findProductById).not.toHaveBeenCalled();
    });
  });

  // Error handling
  describe("when an unexpected error occurs", () => {
    it("should return 500 on unexpected error", async () => {
      (findProductById as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected DB error");
      });

      const result = await handler(buildEvent("prod-001"), mockContext);

      expect(result).toMatchObject({ statusCode: 500 });
      expect(internalErrorResponse).toHaveBeenCalledWith(mockContext.awsRequestId);
    });
  });
});