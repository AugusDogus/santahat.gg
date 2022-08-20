import DiscordButton from './DiscordButton';
import Image from 'next/future/image';
import { useSession } from 'next-auth/react';

const DiscordCTA: React.FC = () => {
  const { data: sessionData, status } = useSession();

  if (status === 'loading')
    return (
      <div className="flex rounded-md bg-[#23272a]">
        <div className="relative overflow-hidden rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-rose-100/10 before:bg-gradient-to-r before:from-transparent before:via-rose-100/10 before:to-transparent">
          <div className="flex flex-row items-center space-x-3 p-3">
            <div className="h-[45px] w-[45px] rounded-full bg-rose-100/10"></div>
            <div className="w-[200px] space-y-2">
              <div className="h-3 w-4/5 rounded-lg bg-rose-100/10"></div>
              <div className="h-3 w-2/5 rounded-lg bg-rose-100/20"></div>
            </div>
            <div className="h-[40px] w-[100px] rounded-md bg-rose-100/20 pl-3"></div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-[#23272a] flex rounded-md">
      <div className="flex flex-row p-3 space-x-3 items-center">
        <Image className="rounded-full w-[45px] h-[45px]" src="/logo.png" width={44.8} height={44.8} alt="Default profile picture." />
        <div className="leading-4">
          <h3 className="text-[0.8em]">{sessionData ? `Welcome ${sessionData?.user?.name}` : 'Want to see your own avatar here?'}</h3>
          <h4 className="text-[1em] font-medium">{sessionData ? 'Merry Christmas!' : 'Log in now!'}</h4>
        </div>
        <DiscordButton />
      </div>
    </div>
  );
};

export default DiscordCTA;
