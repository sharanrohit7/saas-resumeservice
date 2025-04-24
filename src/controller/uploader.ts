import { Request, Response } from 'express';
import multer from 'multer';

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { uploadPDFsToAzure } from '../utils/fileUpload';

// Configure Multer for secure temporary storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create temp directory if it doesn't exist
    const uploadDir = 'temp/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniqueName = `${uuidv4()}-${sanitizedName}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 20 // Maximum 20 files per batch
  }
}).array('resumes'); // Field name for the files

// Pure upload controller function
export const uploadResumesController = async (req: Request, res: Response) => {
  try {
    // 1. Handle file upload to temp storage
    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err: any) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return reject(new Error(`File size exceeds 10MB limit`));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return reject(new Error(`Maximum 20 files allowed per upload`));
          }
          if (err.message.includes('Invalid file type')) {
            return reject(new Error(err.message));
          }
          return reject(new Error(`File upload failed: ${err.message}`));
        }
        resolve();
      });
    });

    // 2. Validate uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files were uploaded' 
      });
    }

    const files = req.files as Express.Multer.File[];
    
    // 3. Upload to Azure Blob Storage
    const filePaths = files.map(file => file.path);
    const uploadResults = await uploadPDFsToAzure(filePaths);

    // 4. Prepare success/failure reports
    const successfulUploads = uploadResults.filter(result => result.success);
    const failedUploads = uploadResults.filter(result => !result.success);

    // 5. Cleanup temp files (always execute)
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.error(`Failed to delete temp file ${file.path}:`, cleanupError);
      }
    });

    // 6. Send response
    res.status(200).json({
      success: true,
      message: `Successfully processed ${files.length} file(s)`,
      uploaded: successfulUploads.length,
      failed: failedUploads.length,
      results: uploadResults.map((result, index) => ({
        originalName: files[index].originalname,
        storageUrl: result.url,
        status: result.success ? 'uploaded' : 'failed',
        error: result.error
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Cleanup any uploaded temp files on error
    if (req.files?.length) {
      (req.files as Express.Multer.File[]).forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error(`Failed to cleanup temp file ${file.path}:`, cleanupError);
        }
      });
    }

    const statusCode = error instanceof Error && error.message.includes('Invalid file type') ? 400 : 500;
    const errorMessage = error instanceof Error ? error.message : 'File upload failed';

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
};