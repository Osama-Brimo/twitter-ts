import { Button } from '@/components/app/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import FormTextField from '@/components/form/FormTextField';
import { Form } from '@/components/ui/form';
import { loginSchema } from '@/lib/zod';
import { loginUser as loginUserMutation } from '@/gql/mutations/common/User.js';
import { ApolloError, useMutation } from '@apollo/client';
import { Link, Navigate, redirect, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserProvider';
import { toast } from 'sonner';
import { setAuthCookieFromData } from '@/lib/helpers';
import { useCallback } from 'react';
import { GraphQLErrorCustomJsonMsg } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// TODO: put an image here

export type LoginFormValues = z.infer<typeof loginSchema>;
export type LoginFormField = keyof LoginFormValues;

const Login = () => {
  const [loginUser] = useMutation(loginUserMutation);
  const { user, refetchUser } = useUser();

  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const submitHandler = useCallback(
    async (values: LoginFormValues) => {
      try {
        await loginUser({
          variables: values,
          onCompleted: async (data) => {
            console.log('completed login from login.tsx!', data);
            setAuthCookieFromData(data.loginUser);
            // Context will be updated with new user. refetch query.
            await refetchUser();
            navigate('/');
          },
        });
      } catch (error) {
        if (error instanceof ApolloError) {
          const { message: errMsg } = error;
          const { message, field } =
            (JSON.parse(errMsg) as GraphQLErrorCustomJsonMsg) ?? {};

          if (field && message) {
            console.log(`[submitHandler]: Login form error field:`, field);
            form.setError(field as LoginFormField, { message });
          }
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      }
    },
    [form, loginUser, navigate, refetchUser],
  );

  if (user?.id) return <Navigate to="/" />;

  return (
    <>
      <header className="w-full absolute top-0 py-4 z-40 flex justify-start gap-4 border-none bg-transparent px-4">
        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      </header>
      <div className="w-full h-full lg:grid lg:min-h-[100vh] lg:grid-cols-2">
        <div className="flex items-center justify-center py-12">
          <Form {...form}>
            <form
              className="mx-auto grid w-[350px] gap-6 pr-6"
              onSubmit={form.handleSubmit(submitHandler)}
            >
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Login</h1>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormTextField
                    control={form.control}
                    formLabel="Email"
                    placeholder="Enter your Email"
                    name="email"
                    type="email"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="grid gap-2">
                    <FormTextField
                      control={form.control}
                      formLabel="Password"
                      placeholder="Enter your password"
                      name="password"
                      type="password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don't have an account?
                <Link to="/signup" className="underline ml-1">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </div>
        <div className="hidden bg-muted lg:block">
          <img
            src="/placeholder.svg"
            alt="img"
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </>
  );
};

export default Login;
