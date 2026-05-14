export const openApiSpec = (apiUrl: string) => ({
  openapi: "3.0.0",
  info: {
    title: "Products API",
    version: "1.0.0",
    description: "Products REST API",
  },
  servers: [
    {
      url: apiUrl,
      description: "API Gateway",
    },
  ],
  paths: {
    "/products": {
      get: {
        summary: "Get all products",
        operationId: "getProductsList",
        responses: {
          "200": {
            description: "List of products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProductWithStock" },
                    },
                    meta: { $ref: "#/components/schemas/ResponseMeta" },
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      post: {
        summary: "Create a new product",
        operationId: "createProduct",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
              example: {
                title: "Sony WH-1000XM5",
                description: "Noise cancelling headphones",
                price: 29.99,
                count: 45,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        product: { $ref: "#/components/schemas/Product" },
                        stock:   { $ref: "#/components/schemas/Stock" },
                      },
                    },
                    meta: { $ref: "#/components/schemas/ResponseMeta" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/products/{productId}": {
      get: {
        summary: "Get product by ID",
        operationId: "getProductById",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "b3f7e2a1-1234-5678-abcd-ef0123456789",
          },
        ],
        responses: {
          "200": {
            description: "A single product with stock",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/ProductWithStock" },
                    meta: { $ref: "#/components/schemas/ResponseMeta" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
  },
  components: {
    schemas: {
      // ── Product ─────────────────────────────────────────────────────────────
      Product: {
        type: "object",
        properties: {
          id:          { type: "string", format: "uuid", example: "b3f7e2a1-1234-5678-abcd-ef0123456789" },
          title:       { type: "string", example: "Sony WH-1000XM5" },
          description: { type: "string", example: "Noise cancelling headphones" },
          price:       { type: "number", example: 29.99 },
        },
        required: ["id", "title", "price"],
      },

      // ── Stock ────────────────────────────────────────────────────────────────
      Stock: {
        type: "object",
        properties: {
          product_id: { type: "string", format: "uuid", example: "b3f7e2a1-1234-5678-abcd-ef0123456789" },
          count:      { type: "integer", minimum: 0, example: 45 },
        },
        required: ["product_id", "count"],
      },

      // ── ProductWithStock ─────────────────────────────────────────────────────
      ProductWithStock: {
        type: "object",
        properties: {
          id:          { type: "string", format: "uuid", example: "b3f7e2a1-1234-5678-abcd-ef0123456789" },
          title:       { type: "string", example: "Sony WH-1000XM5" },
          description: { type: "string", example: "Noise cancelling headphones" },
          price:       { type: "number", example: 29.99 },
          count:       { type: "integer", minimum: 0, example: 45 },
        },
        required: ["id", "title", "price", "count"],
      },

      // ── CreateProductRequest ─────────────────────────────────────────────────
      CreateProductRequest: {
        type: "object",
        required: ["title", "price", "count"],
        properties: {
          title:       { type: "string",  example: "Sony WH-1000XM5" },
          description: { type: "string",  example: "Noise cancelling headphones" },
          price:       { type: "number",  example: 29.99 },
          count:       { type: "integer", minimum: 0,  example: 45 },
        },
      },

      // ── ResponseMeta ─────────────────────────────────────────────────────────
      ResponseMeta: {
        type: "object",
        properties: {
          timestamp: { type: "string", format: "date-time" },
          requestId: { type: "string" },
          total:     { type: "integer" },
        },
      },

      // ── Error ────────────────────────────────────────────────────────────────
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code:    { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Validation failed" },
              details: { type: "object" },
            },
          },
        },
      },
    },

    // ── Reusable responses ────────────────────────────────────────────────────
    responses: {
      ValidationError: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      InternalServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});