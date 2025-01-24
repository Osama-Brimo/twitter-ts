import { useCallback } from 'react';
import { UploadedFileInfo } from './types';
import {
  Media,
  MutationCreateMediaArgs,
  MutationDeleteManyMediaArgs,
  User,
} from '@/gql/graphql';
import { getExtensionFromMimetype } from './helpers';
import axios from 'axios';
import {
  createMedia as createMediaMutation,
  deleteManyMedia as deleteManyMediaMutation,
} from '@/gql/mutations/common/Media';
import { useMutation } from '@apollo/client';

type UploadMediaServerResponseData = {
  uploaded: UploadedFileInfo[];
};

interface UploadMediaServerResponse {
  data: UploadMediaServerResponseData;
}

export const useMediaUpload = () => {
  const [createMedia] = useMutation(createMediaMutation);

  /**
   * Uploads a Filelist to S3, then, if successful, creates `Media` for each.
   *
   * If no user is provided, media is created without user association.
   *
   * @argument files - `FileList` to upload and created `Media` with.
   * @argument otherUser - `FileList` to upload and created `Media` with.
   * @argument userIsRequired - If `true`, operation will fail if no user is available to link.
   *
   * @returns Media[] - An array of Media representing the uploaded files (or an empty array if operation fails).
   */
  const uploadAndCreateMedia = useCallback(
    async ({
      files,
      user,
      asAvatar = false,
    }: {
      files: FileList;
      user?: User;
      asAvatar?: boolean;
    }) => {
      // Nothing to upload
      if (!files?.length) return [];

      try {
        // Grab files from FileList as array, and append to request as FormData
        const fileArr = [...files];

        const formData = new FormData();
        fileArr.forEach((file) => formData.append('media', file));

        // Successful response returns uploaded files with keys
        const { data } = (await axios.post(
          //TODO: this is hardcoded for now, replace with server url and find a good way to share constants in a monorepo
          'http://localhost:4000/api/media',
          formData,
        )) as UploadMediaServerResponse;

        // Grab keys from response
        const uploaded = (data?.uploaded as UploadedFileInfo[]) ?? [];
        console.log('[uploadAndCreateMedia]: S3 keys returned:', uploaded);

        // If files uploaded successfully and returned keys, createMedia for each key, and save ids in array
        const createdMedia: Media[] = [];
        const mediaCreationPromises = uploaded.map((file) => {
          const { key, originalname: filename, mimetype, size } = file;
          const variables: MutationCreateMediaArgs = {
            key,
            filename,
            mimetype,
            extension: getExtensionFromMimetype(mimetype) || '',
            size,
          };

          // Set uploader id if exists / Set as avatar
          if (user?.id) {
            variables.uploaderId = user.id
            if (asAvatar && fileArr.length === 1) {
              variables.asAvatar = true
            }
          }

          return createMedia({
            variables,
            onCompleted({ createMedia: createMediaCompletedResult }) {
              const newMedia: Media = createMediaCompletedResult;
              createdMedia.push(newMedia);
              console.log(
                `[uploadAndCreateMedia]: Media entity for file created:`,
                newMedia,
              );
            },
            onError: (error) => {
              console.error(
                `[uploadAndCreateMedia]: Failed to create Media entity for file.`,
                error,
              );
            },
          });
        });

        await Promise.all(mediaCreationPromises)
          .then(() => {
            console.log(
              '[uploadAndCreateMedia]: Media creation done, all created media:',
              createdMedia,
            );
          })
          .catch(async () => {
            console.error(
              '[uploadAndCreateMedia]: Media upload or creation failed.',
              createdMedia,
            );
          });

        return createdMedia;
      } catch (error) {
        return [];
      }
    },
    [createMedia],
  );

  return { uploadAndCreateMedia };
};
