import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "~/components/header";
import { ThemeProvider } from "~/components/theme-provider";
import { HatStorageProvider } from "~/contexts/hat-storage-context";

export const metadata: Metadata = {
  metadataBase: new URL("https://santahat.gg"),
  title: "Santa Hat Bot",
  description: "Slap a Santa hat on your Discord avatar today!",
  icons: [{ rel: "icon", url: "/logo.png" }],
  openGraph: {
    images: ["/logo.png"],
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HatStorageProvider>
            <Header />
            {children}
          </HatStorageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
