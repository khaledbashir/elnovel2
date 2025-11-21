"use client";

import { type Dispatch, type ReactNode, type SetStateAction, createContext } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { TamboProvider } from "@tambo-ai/react";
import useLocalStorage from "@/hooks/use-local-storage";
import { getTamboConfig } from "@/lib/tambo/setup";
import { ThemeToggle } from "@/components/tailwind/ui/theme-toggle";

export const AppContext = createContext<{
  font: string;
  setFont: Dispatch<SetStateAction<string>>;
}>({
  font: "Default",
  setFont: () => {},
});

const ToasterProvider = () => {
  const { theme } = useTheme() as {
    theme: "light" | "dark" | "system";
  };
  return <Toaster theme={theme} />;
};

const TamboProviderWrapper = ({ children }: { children: ReactNode }) => {
  const config = getTamboConfig();

  // Only render TamboProvider if API key is configured
  if (!config.apiKey) {
    console.warn("Tambo provider not initialized - missing API key");
    return <>{children}</>;
  }

  return (
    <TamboProvider
      apiKey={config.apiKey}
      tamboUrl={config.tamboUrl}
      components={config.components}
      tools={config.tools}
      contextHelpers={config.contextHelpers}
      streaming={true}
      autoGenerateThreadName={true}
      autoGenerateNameThreshold={3}
    >
      {children}
    </TamboProvider>
  );
};

export default function Providers({ children }: { children: ReactNode }) {
  const [font, setFont] = useLocalStorage<string>("novel__font", "Default");

  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange defaultTheme="system">
      <AppContext.Provider
        value={{
          font,
          setFont,
        }}
      >
        <TamboProviderWrapper>
          <ToasterProvider />
          <div className="sticky top-0 z-30 w-full bg-background/90 backdrop-blur border-b">
            <div className="flex w-full max-w-screen-lg mx-auto items-center justify-end gap-2 px-4 py-2">
              <ThemeToggle />
            </div>
          </div>
          {children}
          <Analytics />
        </TamboProviderWrapper>
      </AppContext.Provider>
    </ThemeProvider>
  );
}
