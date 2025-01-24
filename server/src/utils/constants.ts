import rootPath from 'app-root-path'

export const GRAPHQL_SCHEMA_PATH = rootPath.resolve('/schema.graphql');
export const STATIC_PATH = rootPath.resolve('/static');
export const UPLOADS_PATH = rootPath.resolve('/uploads');

export const accessKey = process.env.ACCESS_KEY;
export const secretAccessKey = process.env.SECRET_ACCESS_KEY;

export const bucketName = process.env.BUCKET_NAME;
export const bucketRegion = process.env.BUCKET_REGION;

export const cloudfrontDistributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
export const cloudfrontDomainName = process.env.CLOUDFRONT_DOMAIN_NAME;
export const cloudfrontKeypairId = process.env.CLOUDFRONT_KEYPAIR_ID;
export const cloudfrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY;