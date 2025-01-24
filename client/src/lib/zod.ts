import { z } from 'zod';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIMETYPES,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE,
} from './constants';
import { readableFileSize } from './helpers';

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50),
    email: z.string().email({
      message: 'Please enter a valid email',
    }),
    handle: z
      .string()
      .regex(/^(\w)*$/gm, {
        message:
          'Handle can only contain alphanumeric characters and underscores',
      })
      .min(4, { message: 'Handle must be at least 4 characters long' })
      .max(15, { message: 'Handle cannot be longer than 15 characters' }),
    // TODO: change this later before deploy to include proper secure pass checks, annoying on dev
    password: z
      .string()
      .min(5, { message: 'Password must be at least 5 characters' }),
    confirmPassword: z.string(),
    media: z
    .instanceof(FileList)
    .refine((files) => files.length <= 1, {
      message: `Please select one image to use as an avatar.`,
    })
    .refine((files) => [...files].every((file) => ALLOWED_MIMETYPES.includes(file.type)), {
      message: `Allowed file types are: ${ALLOWED_EXTENSIONS}`,
    })
    .refine((files) => [...files].every((file) => file.size < MAX_FILE_SIZE), {
      message: `File is too large. Max size is ${readableFileSize(MAX_FILE_SIZE)}`,
    })
    .optional(),
  })
  .superRefine(({ password, confirmPassword }, context) => {
    if (confirmPassword !== password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email',
  }),
  password: z
    .string()
    .min(5, { message: 'Password must be at least 5 characters' }),
});

export const tweetSchema = z.object({
  content: z
    .string()
    .max(280, { message: 'Tweets must be 280 characters or less.' }),
  media: z
    .instanceof(FileList)
    .refine((files) => files.length <= MAX_FILE_COUNT, {
      message: `You can only attach up to 4 images to a tweet`,
    })
    .refine((files) => [...files].every((file) => ALLOWED_MIMETYPES.includes(file.type)), {
      message: `Allowed file types are: ${ALLOWED_EXTENSIONS}`,
    })
    .refine((files) => [...files].every((file) => file.size < MAX_FILE_SIZE), {
      message: `Some files are too large. Max size is ${readableFileSize(MAX_FILE_SIZE)}`,
    })
    .nullable(),
});

export const searchSchema = z.object({
  q: z.string(),
});
