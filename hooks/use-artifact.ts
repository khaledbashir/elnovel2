import { create } from "zustand";

interface ArtifactState {
    isVisible: boolean;
    toggleVisibility: () => void;
    setVisibility: (isVisible: boolean) => void;
}

export const useArtifactSelector = create<ArtifactState>((set) => ({
    isVisible: true,
    toggleVisibility: () => set((state: ArtifactState) => ({ isVisible: !state.isVisible })),
    setVisibility: (isVisible: boolean) => set({ isVisible }),
}));

export const useArtifact = useArtifactSelector;
