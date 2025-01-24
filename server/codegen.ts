import type { CodegenConfig } from '@graphql-codegen/cli';
import {
  DateTimeResolver,
  UUIDResolver,
  JSONResolver,
  NonNegativeIntResolver,
  JWTResolver,
} from 'graphql-scalars';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../schema.graphql',
  generates: {
    'src/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          DateTime: DateTimeResolver.extensions.codegenScalarType,
          UUID: UUIDResolver.extensions.codegenScalarType,
          NonNegativeInt: NonNegativeIntResolver.extensions.codegenScalarType,
          JSON: JSONResolver.extensions.codegenScalarType,
          JWT: JWTResolver.extensions.codegenScalarType,
        },
      },
    },
  },
};

export default config;
