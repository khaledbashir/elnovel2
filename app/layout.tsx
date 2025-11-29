import "@/styles/globals.css";
import "@/styles/prosemirror.css";
import 'katex/dist/katex.min.css';

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";

const title = "Papyrus - AI Document Platform";
const description =
  "Smart documents powered by AI";

export const metadata: Metadata = {
  metadataBase: new URL("https://novel.sh"),
  title: "Papyrus",
  description: "Your AI writing assistant",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    images: [`/opengraph-image.png`],
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
    creator: "@steventey",
    images: [`/opengraph-image.png`],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
