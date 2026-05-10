import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { openApiSpec } from "@products-api/shared";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath ?? "";
   const apiUrl = process.env.API_URL ?? "";

  // Serve the OpenAPI JSON spec
  if (path.endsWith("/swagger.json")) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(openApiSpec(apiUrl)),
    };
  }

  // Serve Swagger UI HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Products API Docs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: "swagger/swagger.json",
            dom_id: "#swagger-ui",
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: "BaseLayout"
          });
        </script>
      </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html,
  };
};