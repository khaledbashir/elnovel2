"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, FileText, Folder, MoreHorizontal, Plus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/tailwind/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/tailwind/ui/dropdown-menu";

export interface SidebarItemProps {
    id: string;
    label: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    isExpanded?: boolean;
    hasChildren?: boolean;
    level?: number;
    onClick?: () => void;
    onToggle?: (e: React.MouseEvent) => void;
    onAddChild?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
    onRename?: (e: React.MouseEvent) => void;
}

export function SidebarItem({
    id,
    label,
    icon,
    isActive,
    isExpanded,
    hasChildren,
    level = 0,
    onClick,
    onToggle,
    onAddChild,
    onDelete,
    onRename,
}: SidebarItemProps) {
    return (
        <div
            className={cn(
                "group flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md cursor-pointer transition-colors min-h-[32px]",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
            onClick={onClick}
        >
            <div
                role="button"
                className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-sm hover:bg-muted-foreground/20 transition-colors",
                    !hasChildren && "invisible",
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle?.(e);
                }}
            >
                <ChevronRight
                    className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        isExpanded && "rotate-90",
                    )}
                />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
                {icon || <FileText className="w-4 h-4 shrink-0" />}
                <span className="truncate">{label}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                {onAddChild && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 hover:bg-muted-foreground/20"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(e);
                        }}
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                )}
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-muted-foreground/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {onRename && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onRename(e);
                            }}>
                                Rename
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onDelete && (
                            <DropdownMenuItem 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(e);
                                }}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    isCollapsible?: boolean;
    defaultExpanded?: boolean;
}

export function SidebarSection({
    title,
    children,
    action,
    isCollapsible = false,
    defaultExpanded = true,
}: SidebarSectionProps) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    return (
        <div className="mb-2">
            <div 
                className={cn(
                    "group flex items-center justify-between px-3 py-1 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                    isCollapsible && "cursor-pointer hover:text-foreground"
                )}
                onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-1">
                    {isCollapsible && (
                        <ChevronDown 
                            className={cn(
                                "w-3 h-3 transition-transform duration-200",
                                !isExpanded && "-rotate-90"
                            )} 
                        />
                    )}
                    <span>{title}</span>
                </div>
                {action && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        {action}
                    </div>
                )}
            </div>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
