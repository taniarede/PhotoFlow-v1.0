import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const uploadDir = path.resolve('uploads');
const outputDir = path.resolve('output');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

/**
 * Removes all existing files and directories inside a directory
 * while keeping the directory itself.
 */
function clearDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });

  for (const entry of fs.readdirSync(directory)) {
    const entryPath = path.join(directory, entry);

    fs.rmSync(entryPath, {
      recursive: true,
      force: true,
    });
  }
}

/**
 * Prepare a completely clean workspace before a new batch
 * of photographs is uploaded.
 *
 * IMPORTANT:
 * This middleware is only used by the photograph upload
 * endpoint. It must NOT be used by /watermark because the
 * watermark upload happens after the photographs are uploaded.
 */
function clearWorkspaceBeforePhotoUpload(_req, _res, next) {
  try {
    clearDirectory(uploadDir);
    clearDirectory(outputDir);

    next();
  } catch (error) {
    console.error(
      'Failed to clear upload/output directories:',
      error
    );

    next(error);
  }
}

const upload = multer({
  dest: uploadDir,
});

/**
 * Upload a new batch of photographs.
 *
 * Before Multer writes the new files:
 *   1. uploads/ is emptied
 *   2. output/ is emptied
 *   3. the new photographs are uploaded
 */
router.post(
  '/',
  clearWorkspaceBeforePhotoUpload,
  upload.array('photos'),
  (req, res) => {
    res.json({
      files: (req.files || []).map(file => ({
        id: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
      })),
    });
  }
);

/**
 * Upload watermark.
 *
 * DO NOT clear uploads/ or output/ here.
 *
 * The photographs have already been uploaded and must remain
 * available for processing.
 */
router.post(
  '/watermark',
  upload.single('watermark'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'No watermark file supplied',
      });
    }

    res.json({
      file: {
        id: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
      },
    });
  }
);

export default router;