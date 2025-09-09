import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  // 1st step, check if user is authenticated
  const session = await auth();
  console.log('1st Step: Session in chat page:', session);

  if (!session) {
    // 2nd step, User is not authenticated, hence, redirect to 'api/auth/guest'
    console.log('2nd Step: No session found, redirecting to guest auth');
    redirect('/api/auth/guest');
  }

  // 2nd step, User is authenticated, hence, proceed to create a new chat ID
  const id = generateUUID();
  console.log('2nd Step: Generated chat ID:', id);

  // 3rd step, Check if there is a cookie for chat model preference
  const cookieStore = await cookies();
  console.log('3rd Step: Cookies:', cookieStore.getAll());

  // 4th step, Get the chat model from the cookie if it exists
  const modelIdFromCookie = cookieStore.get('chat-model');
  console.log('4th Step: Chat model from cookie:', modelIdFromCookie);

  if (!modelIdFromCookie) {
    // 5th step, No chat model found in cookie, use the default chat model
    console.log('5th Step: No chat model found in cookie, using default');
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    // 6th step, Chat model found in cookie, use it
    console.log('6th Step: Using chat model from cookie:', modelIdFromCookie.value),
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie.value}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler />
    </>
  );
}
