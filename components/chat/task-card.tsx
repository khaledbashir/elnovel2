"use client";

import React from 'react';
import { CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface TaskStep {
    id: string;
    label: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    details?: string;
}

interface TaskCardProps {
    title: string;
    steps: TaskStep[];
    isExpanded?: boolean;
}

export function TaskCard({ title, steps, isExpanded = true }: TaskCardProps) {
    const [expanded, setExpanded] = React.useState(isExpanded);

    return (
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-sm overflow-hidden my-2">
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    </div>
                    <span className="text-sm font-medium">{title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                    {steps.filter(s => s.status === 'completed').length}/{steps.length}
                </span>
            </div>

            {/* Steps List */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                    >
                        <div className="p-3 space-y-3">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-start gap-3">
                                    {/* Status Icon */}
                                    <div className="mt-0.5">
                                        {step.status === 'completed' && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        )}
                                        {step.status === 'running' && (
                                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                        )}
                                        {step.status === 'pending' && (
                                            <Circle className="w-4 h-4 text-muted-foreground/30" />
                                        )}
                                        {step.status === 'failed' && (
                                            <div className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-red-500">!</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-1">
                                        <p className={cn(
                                            "text-sm leading-none",
                                            step.status === 'completed' ? "text-muted-foreground" : "text-foreground font-medium",
                                            step.status === 'pending' && "text-muted-foreground/50"
                                        )}>
                                            {step.label}
                                        </p>
                                        {step.details && (
                                            <p className="text-xs text-muted-foreground pl-1 border-l-2 border-border/50">
                                                {step.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
