import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { handler } from "../product_service/lambdas/get_products_list/src/index";
 
// ── Mock shared package ───────────────────────────────────────────────────────
jest.mock("@products-api/shared", () => ({
  Logger: jest.fn().mockImplementation(() => ({
    withRequestId: jest.fn().mockReturnThis(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
  PRODUCTS: [
    {
      id: "prod-001",
      title: "Sony Headphones",
      description: "Noise cancelling headphones",
      price: 349.99,
    },
    {
      id: "prod-002",
      title: "Nike Shoes",
      description: "Running shoes",
      price: 159.99,
    },
    {
      id: "prod-003",
      title: "MacBook Pro",
      description: "Apple laptop",
      price: 1999.0,
    },
  ],
  successResponse: jest.fn((data, meta) => ({
    statusCode: 200,
    body: JSON.stringify({ success: true, data, meta }),
  })),
  internalErrorResponse: jest.fn(() => ({
    statusCode: 500,
    body: JSON.stringify({ success: false, error: { message: "Internal server error" } }),
  })),
}));
 
import { PRODUCTS, successResponse, internalErrorResponse } from "@products-api/shared";
 
// ── Test helpers ──────────────────────────────────────────────────────────────
const mockContext = {
  awsRequestId: "test-request-id-123",
} as Context;
 
const buildEvent = (queryStringParameters?: Record<string, string>): APIGatewayProxyEventV2 =>
  ({
    rawPath: "/products",
    requestContext: {
      http: { method: "GET" },
    },
    queryStringParameters,
  } as unknown as APIGatewayProxyEventV2);
 
// ── Tests ─────────────────────────────────────────────────────────────────────
describe("getProductsList handler", () => {
 
  beforeEach(() => {
    jest.clearAllMocks();
  });
 
  // ── Success ──────────────────────────────────────────────────────────────────
  describe("when no filters are applied", () => {
    it("should return 200 with all products", async () => {
      const result = await handler(buildEvent(), mockContext);
 
      expect(result).toMatchObject({ statusCode: 200 });
      expect(successResponse).toHaveBeenCalledWith(
        PRODUCTS,
        {
          total: PRODUCTS.length,
          requestId: mockContext.awsRequestId,
        }
      );
    });
 
    it("should return all 3 products", async () => {
      await handler(buildEvent(), mockContext);
 
      const [data] = (successResponse as jest.Mock).mock.calls[0];
      expect(data).toHaveLength(3);
    });
  });
 
  // ── Meta ──────────────────────────────────────────────────────────────────────
  describe("response meta", () => {
    it("should include requestId in meta", async () => {
      await handler(buildEvent(), mockContext);
 
      const [, meta] = (successResponse as jest.Mock).mock.calls[0];
      expect(meta.requestId).toBe("test-request-id-123");
    });
 
    it("should include correct total in meta", async () => {
      await handler(buildEvent(), mockContext);
 
      const [, meta] = (successResponse as jest.Mock).mock.calls[0];
      expect(meta.total).toBe(3);
    });
  });
 
  // ── Error handling ────────────────────────────────────────────────────────────
  describe("when an unexpected error occurs", () => {
    it("should return 500 on unexpected error", async () => {
      (successResponse as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });
 
      const result = await handler(buildEvent(), mockContext);
 
      expect(result).toMatchObject({ statusCode: 500 });
      expect(internalErrorResponse).toHaveBeenCalledWith(mockContext.awsRequestId);
    });
  });
});