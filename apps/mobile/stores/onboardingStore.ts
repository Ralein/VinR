/**
 * Zustand Onboarding Store
 *
 * Tracks user progress through the 4-step onboarding wizard.
 * Persists selections: name, avatar, moods, music genre, notification prefs.
 */

import { create } from 'zustand';

export interface OnboardingState {
    // Step 1 — Name + Avatar
    name: string;
    avatarId: string | null;

    // Step 2 — Mood baseline
    selectedMoods: string[];

    // Step 3 — Music genre
    musicGenre: string | null;

    // Step 4 — Notifications
    notifyEnabled: boolean;
    notifyTime: string; // HH:MM format

    // Navigation
    currentStep: number;

    // Actions
    setName: (name: string) => void;
    setAvatarId: (id: string) => void;
    toggleMood: (mood: string) => void;
    setMusicGenre: (genre: string) => void;
    setNotifyEnabled: (enabled: boolean) => void;
    setNotifyTime: (time: string) => void;
    setStep: (step: number) => void;
    nextStep: () => void;
    reset: () => void;
}

const initialState = {
    name: '',
    avatarId: null as string | null,
    selectedMoods: [] as string[],
    musicGenre: null as string | null,
    notifyEnabled: true,
    notifyTime: '08:00',
    currentStep: 1,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
    ...initialState,

    setName: (name) => set({ name }),

    setAvatarId: (avatarId) => set({ avatarId }),

    toggleMood: (mood) =>
        set((state) => ({
            selectedMoods: state.selectedMoods.includes(mood)
                ? state.selectedMoods.filter((m) => m !== mood)
                : [...state.selectedMoods, mood],
        })),

    setMusicGenre: (musicGenre) => set({ musicGenre }),

    setNotifyEnabled: (notifyEnabled) => set({ notifyEnabled }),

    setNotifyTime: (notifyTime) => set({ notifyTime }),

    setStep: (currentStep) => set({ currentStep }),

    nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),

    reset: () => set(initialState),
}));
