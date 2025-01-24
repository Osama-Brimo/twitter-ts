import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Toaster, toast } from 'sonner';
import { Link, redirect, useNavigate } from 'react-router-dom';
import { ApolloError, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormTextField from '../components/form/FormTextField';
import { signupSchema } from '../lib/zod';
import { createUser as createUserMutation } from '../gql/mutations/common/User';
import { setAuthCookieFromData } from '../lib/helpers';
import { useUser } from '../context/UserProvider';
import { useCallback, useMemo, useState } from 'react';
import { useMediaUpload } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { ALLOWED_EXTENSIONS } from '@/lib/constants.js';
import { MutationCreateUserArgs, UserPayload } from '@/gql/graphql';
import Button from '@/components/app/Button';
import { GraphQLErrorCustomJsonMsg } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';

// TODO: put an image here

export type SignupFormValues = z.infer<typeof signupSchema>;
export type SignupFormField = keyof SignupFormValues;

const Signup = () => {
  // Hooks
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const [createUser, { loading: mutationLoading }] =
    useMutation(createUserMutation);
  const [signupPending, setSignupPending] = useState(false);
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      handle: '',
      password: '',
      confirmPassword: '',
      // FileList should only be received from APIs, and can't be instantiated
      media: undefined,
    },
  });
  const { uploadAndCreateMedia } = useMediaUpload();

  const loading = useMemo(
    () => signupPending || mutationLoading,
    [mutationLoading, signupPending],
  );

  // Handlers
  const signupSubmitHandler = useCallback(
    async ({
      name,
      email,
      handle,
      password,
      media: files,
    }: SignupFormValues) => {
      setSignupPending(true);
      try {
        const wantsAvatar = files?.length;
        let createdAvatar;
        if (wantsAvatar) {
          const avatarCreateResults = await uploadAndCreateMedia({ files });
          if (avatarCreateResults) {
            createdAvatar = avatarCreateResults[0];
          }
        }

        // If avatar creation fails, form should error so user can resubmit
        if (wantsAvatar && !createdAvatar?.id) {
          form.setError('media', {
            message: 'Could not upload avatar, please try again.',
          });
          setSignupPending(false);
          return;
        }

        // Create the user
        const variables: MutationCreateUserArgs = {
          email,
          name,
          handle,
          password,
          avatarId: createdAvatar?.id ?? undefined,
        };

        await createUser({
          variables,
          onCompleted: async ({ createUser: createUserMutationResult }) => {
            const userPayload: UserPayload = createUserMutationResult;
            const newUser = userPayload?.user;

            console.log(
              `[signupSubmitHandler] User creation succeeded. The user:`,
              newUser,
            );

            // Update the UI
            toast('Signed up successfully!');
            setSignupPending(false);

            // Set the auth cookie
            setAuthCookieFromData(userPayload);
            // context will be updated with new user. refetch query.
            await refetchUser();
            navigate('/');
          },
        });
      } catch (error) {
        console.log(error);
        if (error instanceof ApolloError) {
          const { message: errMsg } = error;
          const { message, field } = JSON.parse(
            errMsg,
          ) as GraphQLErrorCustomJsonMsg;

          if (field && message) {
            console.log(`[submitHandler]: Signup form error field:`, field);
            form.setError(field as SignupFormField, { message: message });
          }
        } else {
          toast.error('Something went wrong.');
        }
        setSignupPending(false);
      }
    },
    [createUser, form, navigate, refetchUser, uploadAndCreateMedia],
  );

  return (
    <>
      <header className='w-full absolute top-0 py-4 z-40 flex justify-start gap-4 border-none bg-transparent px-4'>
        <Button
          size='icon'
          variant='outline'
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          <ChevronLeft className='h-5 w-5' />
          <span className='sr-only'>Back</span>
        </Button>
      </header>
      <div className='w-full h-full lg:grid lg:min-h-[100vh] lg:grid-cols-2'>
        <div className='flex items-center justify-center py-12'>
          <div>
            <Form {...form}>
              <form
                className='mx-auto grid w-[350px] gap-6'
                onSubmit={form.handleSubmit(signupSubmitHandler)}
              >
                <div className='grid gap-2 text-center'>
                  <h1 className='text-3xl font-bold'>Signup</h1>
                  <p className='text-balance text-muted-foreground'>
                    Enter your info to sign up for an account
                  </p>
                </div>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <FormTextField
                      control={form.control}
                      formLabel='Email'
                      placeholder='Enter an Email'
                      name='email'
                      type='email'
                    />
                  </div>
                  <div className='grid gap-2'>
                    <FormTextField
                      control={form.control}
                      formLabel='Name'
                      helperLabel='Your display name, you can change this later'
                      placeholder='Enter a name'
                      name='name'
                    />
                  </div>
                  <div className='grid gap-2'>
                    <FormTextField
                      control={form.control}
                      formLabel='Handle'
                      helperLabel='This will be your @, must be unique'
                      placeholder='Enter a handle'
                      name='handle'
                    />
                  </div>
                  <div className='grid gap-2'>
                    <div className='grid gap-2'>
                      <FormTextField
                        control={form.control}
                        formLabel='Password'
                        placeholder='Enter a password'
                        name='password'
                        type='password'
                      />
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <div className='grid gap-2'>
                      <FormTextField
                        control={form.control}
                        formLabel='Confirm Password'
                        placeholder='Enter password again'
                        name='confirmPassword'
                        type='password'
                      />
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <div className='grid gap-2'>
                      <FormField
                        control={form.control}
                        name='media'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar</FormLabel>
                            <FormControl>
                              <Input
                                multiple
                                accept={ALLOWED_EXTENSIONS}
                                type='file'
                                onChange={(e) => {
                                  console.log(e.target.files);
                                  return field.onChange(
                                    e.target.files ?? undefined,
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button loading={loading} type='submit' className='w-full'>
                    Sign Up
                  </Button>
                </div>
                <div className='mt-4 text-center text-sm'>
                  Already have an account?
                  <Link to='/login' className='underline ml-1'>
                    Log In
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className='hidden bg-muted lg:block'>
          <img
            src='/placeholder.svg'
            alt='img'
            width='1920'
            height='1080'
            className='h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
          />
        </div>
        <Toaster />
      </div>
    </>
  );
};

export default Signup;
