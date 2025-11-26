import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Toast utilities to replace browser alerts
export const notifications = {
    success: (message: string, description?: string) => {
        return toast.success(message, {
            description,
            duration: 4000,
            action: {
                label: "Dismiss",
                onClick: () => {},
            },
        });
    },
    error: (message: string, description?: string) => {
        return toast.error(message, {
            description,
            duration: 6000,
            action: {
                label: "Dismiss",
                onClick: () => {},
            },
        });
    },
    info: (message: string, description?: string) => {
        return toast.info(message, {
            description,
            duration: 4000,
            action: {
                label: "Dismiss",
                onClick: () => {},
            },
        });
    },
    warning: (message: string, description?: string) => {
        return toast.warning(message, {
            description,
            duration: 5000,
            action: {
                label: "Dismiss",
                onClick: () => {},
            },
        });
    },
    loading: (message: string, description?: string) => {
        return toast.loading(message, {
            description,
        });
    },
};
