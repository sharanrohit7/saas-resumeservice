import { BlobServiceClient, BlockBlobClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { promisify } from "util";

const statAsync = promisify(fs.stat);
const readFileAsync = promisify(fs.readFile);

// Config with fallbacks and validation
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING ?? "";
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "resumes-container";
const MAX_CONCURRENT_UPLOADS = 5; // Optimal for most scenarios
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Validate environment variables
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage connection string is not configured");
}

// Initialize clients with error handling
let blobServiceClient: BlobServiceClient;
try {
  blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
} catch (error) {
  throw new Error(`Failed to initialize BlobServiceClient: ${error instanceof Error ? error.message : String(error)}`);
}

const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

interface UploadResult {
  fileName: string;
  url: string;
  success: boolean;
  error?: string;
}

export async function uploadPDFsToAzure(filePaths: string[]): Promise<UploadResult[]> {
  // Validate input
  if (!Array.isArray(filePaths)) {
    throw new TypeError("filePaths must be an array");
  }
  try {
    await ensureContainerExists();

    // Process uploads with concurrency control
    const uploadQueue = filePaths.map(filePath => () => uploadSingleFileWithRetry(filePath));
    const results = await runWithConcurrency(uploadQueue, MAX_CONCURRENT_UPLOADS);
  
    return results;
  } catch (error) {
    console.log(`Error during upload: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Upload process failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper functions
async function ensureContainerExists(): Promise<void> {
  try {
    await containerClient.createIfNotExists({
      access: 'blob',
    });
  } catch (error) {
    throw new Error(`Container setup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function uploadSingleFileWithRetry(filePath: string, attempt = 1): Promise<UploadResult> {
  try {
    const fileName = generateUniqueFileName(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Validate file before upload
    await validatePDFFile(filePath);

    const fileStats = await statAsync(filePath);
    const uploadOptions = {
      blobHTTPHeaders: { blobContentType: "application/pdf" },
      metadata: {
        originalName: path.basename(filePath),
        uploadedAt: new Date().toISOString(),
      }
    };

    // Use uploadFile for better performance on larger files
    await blockBlobClient.uploadFile(filePath, uploadOptions);

    return {
      fileName,
      url: blockBlobClient.url,
      success: true
    };
  } catch (error) {
    if (attempt < MAX_RETRY_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      return uploadSingleFileWithRetry(filePath, attempt + 1);
    }

    return {
      fileName: path.basename(filePath),
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

async function validatePDFFile(filePath: string): Promise<void> {
  try {
    // Basic validation
    const stats = await statAsync(filePath);
    if (!stats.isFile()) {
      throw new Error("Path is not a file");
    }

    // Simple PDF header check (optional)
    const fileDescriptor = await fs.promises.open(filePath, 'r');
    const buffer = Buffer.alloc(4);
    await fileDescriptor.read(buffer, 0, 4, 0);
    await fileDescriptor.close();
    if (!buffer.toString().startsWith("%PDF")) {
      throw new Error("File doesn't appear to be a valid PDF");
    }
  } catch (error) {
    throw new Error(`File validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function generateUniqueFileName(filePath: string): string {
  const originalName = path.basename(filePath);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${baseName}-${timestamp}-${randomString}${extension}`;
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then(result => {
      results.push(result);
      executing.splice(executing.indexOf(p), 1);
    });

    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}