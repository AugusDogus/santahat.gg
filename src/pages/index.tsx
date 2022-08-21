import type { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import DiscordCTA from '../components/DiscordCTA';
import AvatarCanvas from '../components/AvatarCanvas';
import PlausibleProvider from 'next-plausible';

const Home: NextPage = () => {
  const session = useSession();
  const { data: sessionData } = session;
  const avatarURL = sessionData && sessionData.user && sessionData.user.image ? sessionData.user.image : '/default.png';

  return (
    <>
      <Head>
        <title>Santa Hat Bot</title>
        <meta name="description" content="Slap a Santa hat on your Discord avatar today!" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <main className="container flex flex-col items-center justify-center min-h-screen p-4 mx-auto text-slate-200 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold">Santa Hat Bot</h1>
          <h2 className="text-2xl">Slap a Santa hat on your Discord avatar today!</h2>
        </div>
        <DiscordCTA />
        <AvatarCanvas avatarURL={avatarURL} hatURL={'/christmas.png'} />
      </main>
    </>
  );
};

const HomeWithPlausible = () => {
  return (
    <PlausibleProvider domain="santahat.gg" customDomain="plausible.augie.gg" selfHosted>
      <Home />
    </PlausibleProvider>
  );
};

export default HomeWithPlausible;
