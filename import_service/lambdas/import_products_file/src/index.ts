import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  Logger,
  successResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@products-api/shared";

const logger = new Logger("import-products-file");
const s3Client = new S3Client({ region: process.env.AWS_REGION ?? "eu-west-1" });

const BUCKET_NAME    = process.env.BUCKET_NAME ?? "";
const UPLOADED_FOLDER = process.env.UPLOADED_FOLDER ?? "uploaded";
const URL_EXPIRY_SECONDS = 300; // 5 minutes

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const log = logger.withRequestId(context.awsRequestId);
 
  log.info("Received request", { path: event.rawPath });
 
  try {
    // Validate query parameter
    const fileName = event.queryStringParameters?.name;
 
    if (!fileName) {
      return validationErrorResponse("Query parameter 'name' is required (e.g. ?name=products.csv)");
    }
 
    if (!fileName.endsWith(".csv")) {
      return validationErrorResponse("File must be a .csv file");
    }
 
    // Generate presigned URL for S3 upload
    const key = `${UPLOADED_FOLDER}/${fileName}`;
 
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: "text/csv",
    });
 
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRY_SECONDS,
    });
 
    log.info("Presigned URL generated", { key, expiresIn: URL_EXPIRY_SECONDS });
 
    return successResponse(
      { url: presignedUrl, key, expiresIn: URL_EXPIRY_SECONDS },
      { requestId: context.awsRequestId }
    );
  } catch (error) {
    log.error("Unexpected error generating presigned URL", { error });
    return internalErrorResponse(context.awsRequestId);
  }
};