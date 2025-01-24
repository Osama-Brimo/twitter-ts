import { useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/app/Button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import {
  ControllerRenderProps,
  FieldValues,
  useController,
  UseFormReturn,
} from 'react-hook-form';
import { toast } from 'sonner';
import {
  checkFileExtensionAllowed,
  getExtensionFromMimetype,
  readableFileSize,
} from '@/lib/helpers';
import { MAX_FILE_SIZE } from '@/lib/constants';

type AcceptableFileTypes = 'image/';

type AccpetableMimeTypes = {
  [key in AcceptableFileTypes]: string[];
};

interface FileUploadButtonProps {
  // onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  form: UseFormReturn<FieldValues>;
  setFilenames?: React.Dispatch<React.SetStateAction<string[]>>;
  setSize?: React.Dispatch<React.SetStateAction<number>>;
  maxSize?: number;
  maxFileCount?: number;
  multiple?: boolean;
  disabled?: boolean;
  accept?: AccpetableMimeTypes;
}

const FileUploadButton = ({
  form,
  setFilenames,
  setSize,
  maxSize = MAX_FILE_SIZE,
  maxFileCount = 1,
  disabled = false,
  accept = {
    'image/': ['png', 'jpg', 'jpeg', 'gif'],
  },
}: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = form.register('media');

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     const files = [...e.target.files];
  //     console.log('the files', files);

  //     let totalSize = 0;
  //     const fileNames: string[] = [];

  //     try {
  //       files.forEach(async (file) => {
  //         const { name, type: mimetype, size } = file;
  //         const allowed = checkFileExtensionAllowed(accept, mimetype);
  //         const extension = getExtensionFromMimetype(mimetype);

  //         if (allowed) {
  //           console.log(file, 'one file');

  //           const oldVal = form.getValues('media') || [];
  //           const newVal = [...oldVal, file];

  //           console.log(oldVal, newVal, typeof oldVal, typeof newVal);

  //           form.setValue('media', newVal);
  //           fileInputRef.current.value = newVal;

  //           console.log(form.getValues);

  //           totalSize += size;
  //           fileNames.push(`${name}.${extension}`);
  //         } else {
  //           form.setError('media', {
  //             message: `File type is not allowed.`,
  //           });
  //         }
  //       });

  //       if (fileNames.length && setFilenames && setSize) {
  //         setFilenames(fileNames);
  //         setSize(totalSize);
  //       }

  //       if (totalSize > maxSize) {
  //         form.setError('media', {
  //           message: `Max file size exceeded (${readableFileSize(maxSize)}).`,
  //         });
  //       }
  //       console.log(form.getValues());
  //     } catch (error) {
  //       toast('Error uploading files');
  //       console.error('Upload error:', error);
  //     }
  //   }
  // };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileButtonClick}
              type="button"
            >
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Attach File</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* <FormField
        name="media"
        disabled={disabled}
        render={({ field: { value, onChange, ...fieldProps } }) => (
          <FormItem>
            <FormControl>
              <Input
                {...fieldProps}
                type="file"
                disabled={disabled}
                multiple={maxFileCount > 1}
                value={value}
                onChange={(event) =>
                  onChange(event.target.files && event.target.files[0])
                }
                className="hidden"
              />
            </FormControl>
          </FormItem>
        )}
      /> */}
      <FormField
        control={form.control}
        name="media"
        render={({ field }) => {
          return (
            <FormItem>
              <FormControl>
                <Input
                  type="file"
                  placeholder="shadcn"
                  // ref={fileInputRef}
                  {...fileRef}
                  // className="hidden"
                  onChange={(event) => {
                    console.log(event);
                    // form.setValue('media', event.target?.files?.[0]);
                    field.onChange(event.target?.files?.[0] ?? undefined);
                  }}
                />
              </FormControl>
            </FormItem>
          );
        }}
      />
    </>
  );
};

export default FileUploadButton;
