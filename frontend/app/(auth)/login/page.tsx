'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { login, type LoginActionState } from '../actions';
import { useSession } from 'next-auth/react';

export default function Page() {
  const router = useRouter();
  // 1st step in Auth
  console.log('In AUTH: 1st Step: Login page rendered');

  const [email, setEmail] = useState('');
  // 2nd step in Auth
  console.log(`2nd Step: Email state initialized to empty string ${email}`);
  const [isSuccessful, setIsSuccessful] = useState(false);
  // 3rd step in Auth
  console.log(`3rd Step: isSuccessful state initialized to ${isSuccessful}`);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );
  // 4th step in Auth
  console.log(`4th Step: useActionState initialized with login action ${JSON.stringify(state)}`);

  const { update: updateSession } = useSession();
  // 5th step in Auth
  console.log(`5th Step: useSession hook called to manage session state ${JSON.stringify(updateSession)}`);

  useEffect(() => {
    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: 'Invalid credentials!',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  // 6th step in Auth
  console.log('6th Step: useEffect set up to monitor action state changes');

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };
  // 7th step in Auth
  console.log('7th Step: handleSubmit function defined to process form submission');

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
