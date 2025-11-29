"use client";

import * as React from "react";
import { Search, Command, X } from "lucide-react";
import { Input } from "@/components/tailwind/ui/input";
import { cn } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/tailwind/ui/command";

interface SidebarSearchProps {
    onSearch: (query: string) => void;
    className?: string;
}

export function SidebarSearch({ onSearch, className }: SidebarSearchProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <div className={cn("px-3 mb-2", className)}>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center w-full gap-2 px-2 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border"
            >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left truncate">Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Search documents</span>
                        </CommandItem>
                        <CommandItem>
                            <Command className="mr-2 h-4 w-4" />
                            <span>Commands</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    );
}
