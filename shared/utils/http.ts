import { APIGatewayProxyResult } from "aws-lambda";
import { ApiResponse, ApiError, ResponseMeta } from "./types/api";

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
): APIGatewayProxyResult {
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
): APIGatewayProxyResult {
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
): APIGatewayProxyResult {
  const response: ApiResponse<never> = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return buildResponse(statusCode, response);
}

export function notFoundResponse(message: string, code: string): APIGatewayProxyResult {
  return errorResponse(404, { code, message });
}

export function internalErrorResponse(requestId?: string): APIGatewayProxyResult {
  return errorResponse(500, {
    code: "INTERNAL_SERVER_ERROR",
    message: "An internal server error occurred",
    details: requestId ? { requestId } : undefined,
  });
}

export function validationErrorResponse(message: string, details?: Record<string, unknown>): APIGatewayProxyResult {
  return errorResponse(400, {
    code: "VALIDATION_ERROR",
    message,
    details,
  });
}