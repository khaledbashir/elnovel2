"use client";

import React, {
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    createContext,
} from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import useLocalStorage from "@/hooks/use-local-storage";
import { SidebarProvider } from "@/components/ui/sidebar";

export const AppContext = createContext<{
    font: string;
    setFont: Dispatch<SetStateAction<string>>;
}>({
    font: "Default",
    setFont: () => { },
});

const ToasterProvider = () => {
    const { theme } = useTheme() as {
        theme: "light" | "dark" | "system";
    };
    return <Toaster theme={theme} />;
};


export default function Providers({ children }: { children: ReactNode }) {
    const [font, setFontValue] = useLocalStorage<string>(
        "novel__font",
        "Default",
    );
    const setFont = React.useCallback(
        (value: React.SetStateAction<string>) => {
            if (typeof value === "function") {
                setFontValue(value(font));
            } else {
                setFontValue(value);
            }
        },
        [setFontValue, font],
    );

    return (
        <ThemeProvider
            attribute="class"
            enableSystem
            disableTransitionOnChange
            defaultTheme="system"
        >
            <AppContext.Provider
                value={{
                    font,
                    setFont,
                }}
            >
                <SidebarProvider>
                    <ToasterProvider />
                    {children}
                    {/* Vercel Analytics removed - {process.env.NODE_ENV === "production" && <Analytics />} */}
                </SidebarProvider>
            </AppContext.Provider>
        </ThemeProvider>
    );
}
