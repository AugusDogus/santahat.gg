"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useHatStorageContext } from "~/contexts/hat-storage-context";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { HatSelector } from "./hat-selector";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = authClient.useSession();
  const { selectedHat, customHat, selectHat, deleteCustomHat } =
    useHatStorageContext();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav className="fixed top-0 right-0 left-0 z-20 w-full px-2 pt-4">
        <div
          className={cn(
            "mx-auto max-w-4xl border-transparent px-6 transition-all duration-300 lg:px-8",
            isScrolled &&
              "bg-background/50 max-w-md rounded-2xl border backdrop-blur-lg lg:px-5 dark:bg-white/5",
          )}
        >
          <div className="relative flex items-center justify-between py-3">
            <Link
              href="/"
              className="-m-1 flex flex-col rounded-md p-1 opacity-80 duration-150 outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-[#5865F2]/50"
            >
              <span className="text-lg leading-tight font-semibold">
                Santa Hat Bot
              </span>
              <span
                className={cn(
                  "text-muted-foreground text-xs transition-all duration-300",
                  isScrolled && "h-0 opacity-0",
                )}
              >
                Slap a hat on your Discord avatar!
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {session && (
                <>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 md:hidden"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Hat Settings</span>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="px-4 pb-4">
                      <DrawerHeader>
                        <DrawerTitle>Choose a Hat</DrawerTitle>
                      </DrawerHeader>
                      <HatSelector
                        selectedHat={selectedHat}
                        customHat={customHat}
                        onSelectHat={selectHat}
                        onDeleteCustomHat={deleteCustomHat}
                      />
                    </DrawerContent>
                  </Drawer>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden h-9 w-9 md:flex"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Hat Settings</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Choose a Hat</DialogTitle>
                      </DialogHeader>
                      <HatSelector
                        selectedHat={selectedHat}
                        customHat={customHat}
                        onSelectHat={selectHat}
                        onDeleteCustomHat={deleteCustomHat}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link
                  href="https://github.com/AugusDogus/santahat.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}
