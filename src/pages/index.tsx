import type { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import DiscordCTA from '../components/DiscordCTA';
import AvatarCanvas from '../components/AvatarCanvas';
import PlausibleProvider from 'next-plausible';
import Link from 'next/link';

const Home: NextPage = () => {
  const session = useSession();
  const { data: sessionData } = session;
  const avatarURL = sessionData?.user?.image || '/default.png';

  return (
    <>
      <Head>
        <title>Santa Hat Bot</title>
        <meta name="description" content="Slap a Santa hat on your Discord avatar today!" />
        <meta property="og:image" content="/logo.png" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <main className="container flex flex-col items-center justify-center min-h-screen p-2 mx-auto text-slate-200 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold">Santa Hat Bot</h1>
          <h2 className="text-2xl">Slap a Santa hat on your Discord avatar today!</h2>
        </div>
        <DiscordCTA />
        <AvatarCanvas avatarURL={avatarURL} hatURL={'/christmas.png'} />
      </main>
      <Link href='https://github.com/AugusDogus/santahat.gg' className='absolute top-5 right-5'>
        <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" className="fill-white">
          <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
      </Link>
    </>
  );
};

const HomeWithPlausible = () => {
  return (
    <PlausibleProvider domain="santahat.gg" customDomain="https://plausible.augie.gg" selfHosted>
      <Home />
    </PlausibleProvider>
  );
};

export default HomeWithPlausible;
