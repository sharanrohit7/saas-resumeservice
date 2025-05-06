import { Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { uploadPDFsToAzure } from '../utils/fileUpload';
import { createResume } from '../services/resumeService';
import { isUtf8 } from 'buffer';

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


export const uploadResumesController = async (req: Request, res: Response) => {
  try {
    // 1. Handle file upload
    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err: any) => {
        if (err) {
          const knownErrors = {
            LIMIT_FILE_SIZE: 'File size exceeds 10MB limit',
            LIMIT_FILE_COUNT: 'Maximum 20 files allowed per upload',
          };
          const message = knownErrors[err.code as keyof typeof knownErrors] || err.message;
          return reject(new Error(`Upload error: ${message}`));
        }
        resolve();
      });
    });

    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      return res.status(400).json({ success: false, message: 'No files were uploaded' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 2. Upload to Azure
    const filePaths = files.map(file => file.path);
    const uploadResults = await uploadPDFsToAzure(filePaths);

    // 3. Parse and save to DB
    const results = await Promise.allSettled(
      files.map(async (file, i) => {
        const uploadResult = uploadResults[i];
        const originalName = file.originalname;

        if (!uploadResult.success || !uploadResult.url) {
          return {
            originalName,
            status: 'upload_failed',
            reason: uploadResult.error || 'Unknown upload error',
          };
        }

        try {
          const fileBuffer = await fs.promises.readFile(file.path);
          const parsed = await pdfParse(fileBuffer);

          const resumeTitle = path.basename(originalName, '.pdf');
          const content = { text: parsed.text };

          const dbResult = await createResume({
            userId,
            title: resumeTitle,
            content,
            resume_url:uploadResult.url,
          });

          if (!dbResult.success) {
            return {
              originalName,
              status: 'db_error',
              reason: dbResult.message,
            };
          }

          return {
            originalName,
            status: 'saved',
            resumeId: dbResult.data?.id,
            storageUrl: uploadResult.url,
          };
        } catch (err: any) {
          return {
            originalName,
            status: 'parse_failed',
            reason: err.message,
          };
        }
      })
    );

    // 4. Async Cleanup
    await Promise.all(
      files.map(async file => {
        try {
          await fs.promises.unlink(file.path);
        } catch (e) {
          console.error(`Failed to delete temp file: ${file.path}`, e);
        }
      })
    );

    // 5. Final Response
    return res.status(200).json({
      success: true,
      message: `Processed ${files.length} file(s)`,
      results: results.map(r =>
        r.status === 'fulfilled' ? r.value : { status: 'internal_error', reason: r.reason }
      ),
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    // 6. Cleanup on error
    if (req.files) {
      await Promise.all(
        (req.files as Express.Multer.File[]).map(async file => {
          try {
            await fs.promises.unlink(file.path);
          } catch (e) {
            console.error(`Failed to delete temp file: ${file.path}`, e);
          }
        })
      );
    }

    res.status(error.message?.includes('Invalid file type') ? 400 : 500).json({
      success: false,
      message: error.message || 'File upload failed',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};
