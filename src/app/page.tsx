"use client";

import { AvatarCanvas } from "~/components/avatar-canvas";
import { DiscordCTA } from "~/components/discord-cta";
import { useHatStorageContext } from "~/contexts/hat-storage-context";
import { authClient } from "~/lib/auth-client";

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();
  const { selectedHat } = useHatStorageContext();

  const avatarUrl = session?.user?.image ?? "/default.png";

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 pt-20">
      <div className="flex flex-col items-center gap-6">
        <DiscordCTA />
        <AvatarCanvas avatarUrl={avatarUrl} hatUrl={selectedHat} />
      </div>
    </main>
  );
}
