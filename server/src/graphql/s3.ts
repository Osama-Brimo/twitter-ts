import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  // GetObjectCommand,
} from '@aws-sdk/client-s3';
import {
  accessKey as accessKeyId,
  secretAccessKey,
  bucketName,
  bucketRegion as region,
  cloudfrontDistributionId,
  cloudfrontDomainName,
  cloudfrontKeypairId,
  cloudfrontPrivateKey,
} from '../utils/constants';

// If using S3 signed urls directly
//
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';

export const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

export const cf = new CloudFrontClient({
  credentials: {
    accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

export async function uploadFile(
  fileBuffer: Buffer,
  key: string,
  mimetype: string,
) {
  try {
    if (!key) throw new Error('[uploadFile]: No key provided.');

    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: key,
      ContentType: mimetype,
    };

    return await s3.send(new PutObjectCommand(uploadParams));
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteFile(key: string) {
  try {
    if (!key) throw new Error('[deleteFile]: No key provided.');

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    const cfCommand = new CreateInvalidationCommand({
      DistributionId: cloudfrontDistributionId,
      InvalidationBatch: {
        CallerReference: key,
        Paths: {
          Quantity: 1,
          Items: [`/${key}`],
        },
      },
    });

    // Invalidate Cloudfront cache of the image
    await cf.send(cfCommand);

    return s3.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    throw new Error(error);
  }
}

export function getObjectSignedUrl(key: string) {
  try {
    if (!key) throw new Error('[getObjectSignedUrl]: No key provided.');

    // Serve via S3 directly
    //
    // const params = {
    //   Bucket: bucketName,
    //   Key: key,
    // };
    // const command = new GetObjectCommand(params);
    // const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min.

    const cloudfrontUrl = `${cloudfrontDomainName}/${key}`;

    // Serve via Cloudfront without signing
    //
    // return cloudfrontUrl;

    const url = getSignedUrl({
      url: cloudfrontUrl,
      keyPairId: cloudfrontKeypairId,
      privateKey: cloudfrontPrivateKey,
      // For ease of demo purposes, our signed urls expire in 1 minute. In a real app, the period would obviously be much longer
      // And we'd (probably) additionally want to invalidate cache uniquely per resource based on some business logic
      dateLessThan: new Date(Date.now() + 1000 * 60), 
    });

    // console.log(`[getObjectSignedUrl]: trying to fetch url for media:`, url);

    return url;
  } catch (error) {
    // TODO: !errors
    throw new Error(error);
  }
}
