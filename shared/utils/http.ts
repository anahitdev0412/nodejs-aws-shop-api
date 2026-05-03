import { APIGatewayProxyResultV2 } from "aws-lambda";
import { ApiResponse, ApiError, ResponseMeta } from "../types/api";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

export function buildResponse<T>(
  statusCode: number,
  body: ApiResponse<T>
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function successResponse<T>(
  data: T,
  meta?: Partial<ResponseMeta>,
  statusCode = 200
): APIGatewayProxyResultV2 {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  return buildResponse(statusCode, response);
}

export function errorResponse(
  statusCode: number,
  error: ApiError
): APIGatewayProxyResultV2 {
  const response: ApiResponse<never> = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return buildResponse(statusCode, response);
}

export function notFoundResponse(message: string, code: string): APIGatewayProxyResultV2 {
  return errorResponse(404, { code, message });
}

export function internalErrorResponse(requestId?: string): APIGatewayProxyResultV2 {
  return errorResponse(500, {
    code: "INTERNAL_SERVER_ERROR",
    message: "An internal server error occurred",
    details: requestId ? { requestId } : undefined,
  });
}

export function validationErrorResponse(message: string, details?: Record<string, unknown>): APIGatewayProxyResultV2 {
  return errorResponse(400, {
    code: "VALIDATION_ERROR",
    message,
    details,
  });
}