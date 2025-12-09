"use client";

import Image from "next/image";
import { Card } from "~/components/ui/card";
import { authClient } from "~/lib/auth-client";
import { DiscordButton } from "./discord-button";

export function DiscordCTA() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Card className="bg-card animate-pulse p-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-3 w-3/4 rounded" />
            <div className="bg-muted h-3 w-1/2 rounded" />
          </div>
          <div className="bg-muted h-9 w-20 rounded-md" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card p-4">
      <div className="flex items-center gap-3">
        <Image
          src={session?.user?.image ?? "/logo.png"}
          alt={session?.user?.name ?? "User avatar"}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-sm">
            {session
              ? `Welcome, ${session.user?.name}`
              : "Want your avatar here?"}
          </p>
          <p className="font-medium">
            {session ? "Merry Christmas! 🎄" : "Log in with Discord!"}
          </p>
        </div>
        <DiscordButton />
      </div>
    </Card>
  );
}
