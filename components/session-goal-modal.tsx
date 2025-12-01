"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SessionGoalModalProps {
    isOpen: boolean;
    onStartSession: (goal: string) => void;
}

export function SessionGoalModal({ isOpen, onStartSession }: SessionGoalModalProps) {
    const [input, setInput] = useState("");
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancedGoal, setEnhancedGoal] = useState<string | null>(null);

    // Mock AI Enhancement for MVP
    const handleEnhance = async () => {
        if (!input.trim()) return;

        setIsEnhancing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple mock enhancement logic
        const enhancements = [
            `Draft a comprehensive ${input} with a focus on clarity and engagement.`,
            `Create a structured outline for ${input}, ensuring all key points are covered.`,
            `Write a professional ${input} that targets the intended audience effectively.`
        ];

        setEnhancedGoal(enhancements[0]); // Just pick the first one for now
        setIsEnhancing(false);
    };

    const handleStart = () => {
        const finalGoal = enhancedGoal || input;
        if (finalGoal.trim()) {
            onStartSession(finalGoal);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[500px] [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-primary">🎯</span> Set Session Goal
                    </DialogTitle>
                    <DialogDescription>
                        What do you want to achieve in this session? This helps the AI stay on track.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="goal">Your Objective</Label>
                        <Textarea
                            id="goal"
                            placeholder="e.g., Write a blog post about the future of AI..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="h-24 resize-none"
                        />
                    </div>

                    <AnimatePresence>
                        {enhancedGoal && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-muted/50 p-3 rounded-md border border-primary/20"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-medium text-primary">AI Enhanced Goal</span>
                                </div>
                                <p className="text-sm text-foreground">{enhancedGoal}</p>
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => setEnhancedGoal(null)}
                                    >
                                        Revert
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-primary hover:text-primary"
                                        onClick={() => {
                                            setInput(enhancedGoal);
                                            setEnhancedGoal(null);
                                        }}
                                    >
                                        Use This
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {!enhancedGoal && (
                        <Button
                            variant="outline"
                            onClick={handleEnhance}
                            disabled={!input.trim() || isEnhancing}
                            className="w-full sm:w-auto"
                        >
                            {isEnhancing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Refining...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Enhance Goal
                                </>
                            )}
                        </Button>
                    )}
                    <Button
                        onClick={handleStart}
                        disabled={!input.trim() && !enhancedGoal}
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Start Session
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
