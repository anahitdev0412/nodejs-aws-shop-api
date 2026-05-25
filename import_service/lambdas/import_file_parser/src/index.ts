import { S3Event, S3Handler } from "aws-lambda";
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import csv from "csv-parser";
import { Logger } from "@products-api/shared";

const logger = new Logger("import-file-parser");
const s3Client = new S3Client({ region: process.env.AWS_REGION ?? "eu-west-1" });

const BUCKET_NAME    = process.env.BUCKET_NAME    ?? "";
const PARSED_FOLDER  = process.env.PARSED_FOLDER  ?? "parsed";

// Parse CSV stream
async function parseCsvStream(stream: Readable): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];

    stream
      .pipe(csv())
      .on("data", (row: Record<string, string>) => {
        logger.info("Parsed CSV row", { row });
        results.push(row);
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// Move file from uploaded/ to parsed/
async function moveFileToParsed(key: string): Promise<void> {
  const parsedKey = key.replace(
    process.env.UPLOADED_FOLDER ?? "uploaded",
    PARSED_FOLDER
  );

  // Copy to parsed/
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${key}`,
      Key: parsedKey,
    })
  );

  // Delete from uploaded/
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

// LambdaHandler
export const handler: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const log = logger.withRequestId(record.s3.object.eTag ?? key);

    log.info("Processing file", { bucket: BUCKET_NAME, key });

    try {
      // Fetch file from S3
      const response = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
      );

      if (!response.Body) {
        log.warn("Empty file body, skipping", { key });
        continue;
      }

      // Parse CSV
      const rows = await parseCsvStream(response.Body as Readable);

      log.info(`Parsed ${rows.length} rows`, { key });

      // Process each row — extend this to write to DynamoDB etc.
    //   for (const row of rows) {
    //     log.info("Parsed row", { row });
    //     // TODO: write to DynamoDB or send to SQS
    //   }

      // Move to parsed/
      await moveFileToParsed(key);

      log.info("File moved to parsed folder", { key });
    } catch (error) {
      log.error("Failed to process file", { key, error });
      throw error; // rethrow so Lambda retries
    }
  }
};