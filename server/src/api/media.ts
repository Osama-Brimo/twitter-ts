import Express from 'express';
import multer, { Multer } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { deleteFile, uploadFile } from '../graphql/s3';
import { Media } from '@prisma/client';

const mediaRouter = Express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5242880 } }); // 5 MiB

interface UploadedFileInfo extends Partial<globalThis.Express.Multer.File> {
    key: string;
}

type MulterFile = globalThis.Express.Multer.File;

// We'll only ever allow 6 max uploads in our application since we have a simple use case.
// In a real application, you'd only do this if the route was solely for tweet image uploads and had no dynamic requirements
mediaRouter.post('/api/media', upload.array('media', 6), (req, res) => {
  const files = req.files as MulterFile[];
  const uploaded: UploadedFileInfo[] = [];
  // A Tweet (and Media entities) should ONLY be created in the case that all images attach successfully
  // Therefore, delete all uploaded images if any error occurs. Upon success, return all uploaded.
  if (files.length) {
    const uploadPromises = files.map((file) => {
      console.log(`File upload from API:`, file);

      const { buffer, mimetype } = file;
      const key = uuidv4();
      const singleUploadInfo: UploadedFileInfo = { ...file, key };

      uploaded.push(singleUploadInfo);
      return uploadFile(buffer, key, mimetype);
    });

    Promise.all(uploadPromises)
      .then(() => {
        // All uploads succeeded, return all uploaded
        res.status(201).send({ uploaded });
      })
      .catch(async (err) => {
        console.log('Caught error during file upload in API:', err);
        if (uploaded.length) {
          // if any of the promises fails, discard all uploaded (if any)
          try {
            const deletePromises = uploaded.map((key) => deleteFile(key));
            await Promise.all(deletePromises);
          } catch (deleteBlockError) {
            // If some delete(s) fails
            res.status(500).send({
              message:
                'Upload failed for one or more files, and encountered an error when attempting to delete already uploaded files.',
              error: deleteBlockError,
            });
          }
          // Deleted uploaded media successfully, but requested operation failed and requires resubmission
          res.status(409).send('Upload failed for one or more files.');
        }
        // We got some error with no key length
        res.status(500).send(err);
      });
  }
});

mediaRouter.delete('/api/media/:key', async (req, res) => {
  const key = req.params.key;
  await deleteFile(key);
  res.status(201).send(key);
});

export default mediaRouter;
