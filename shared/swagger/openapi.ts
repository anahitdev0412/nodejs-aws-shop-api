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
    "/dev/products": {
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
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/dev/products/{productId}": {
      get: {
        summary: "Get product by ID",
        operationId: "getProductById",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "A single product",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          "404": { description: "Product not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          id:          { type: "string" },
          productName: { type: "string" },
          description: { type: "string" },
          price:       { type: "number" },
          image:       { type: "string" },
          category:    { type: "string" },
          stock:       { type: "number" },
          rating:      { type: "number" },
        },
      },
    },
  },
});