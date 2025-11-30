"use client";

import type { Session } from "next-auth";
import { startTransition, useMemo, useOptimistic, useState, useEffect } from "react";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";
import { getAvailableProviders } from "@/lib/ai/provider-config";

type Model = {
  id: string;
  name?: string;
  description?: string;
};

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("zai");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);

  const availableProviders = getAvailableProviders();

  // Fetch models when provider changes
  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/models?provider=${selectedProvider}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const data = await response.json();
        setModels(data.models || []);
      } catch (err: any) {
        console.error("Error fetching models:", err);
        setError(err.message || "Failed to load models");
        setModels([]);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, [selectedProvider]);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === optimisticModelId),
    [optimisticModelId, models]
  );

  return (
    <div className="flex items-center gap-2">
      {/* Provider Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="md:h-[34px] md:px-2"
            variant="outline"
          >
            {availableProviders.find(p => p.id === selectedProvider)?.name || "Provider"}
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Select Provider</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableProviders.map((provider) => (
            <DropdownMenuItem
              key={provider.id}
              onSelect={() => setSelectedProvider(provider.id)}
              data-active={provider.id === selectedProvider}
            >
              <div className="flex w-full items-center justify-between">
                <span>{provider.name}</span>
                {provider.id === selectedProvider && (
                  <CheckCircleFillIcon />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Model Selector */}
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger
          asChild
          className={cn(
            "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            className
          )}
        >
          <Button
            className="md:h-[34px] md:px-2"
            data-testid="model-selector"
            variant="outline"
            disabled={loading || models.length === 0}
          >
            {loading ? "Loading..." : selectedModel?.name || selectedModel?.id || "Select Model"}
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[280px] max-w-[90vw] sm:min-w-[300px]"
        >
          {error && (
            <div className="px-2 py-1.5 text-sm text-destructive">
              {error}
            </div>
          )}
          {!error && models.length === 0 && !loading && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No models available
            </div>
          )}
          {models.map((model) => {
            const { id } = model;

            return (
              <DropdownMenuItem
                asChild
                data-active={id === optimisticModelId}
                data-testid={`model-selector-item-${id}`}
                key={id}
                onSelect={() => {
                  setOpen(false);

                  startTransition(() => {
                    setOptimisticModelId(id);
                    saveChatModelAsCookie(id);
                  });
                }}
              >
                <button
                  className="group/item flex w-full flex-row items-center justify-between gap-2 sm:gap-4"
                  type="button"
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-sm sm:text-base">{model.name || id}</div>
                    {model.description && (
                      <div className="line-clamp-2 text-muted-foreground text-xs">
                        {model.description}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
