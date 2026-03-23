/**
 * Zustand Onboarding Store
 *
 * Tracks user progress through the 4-step onboarding wizard.
 * Persists selections: name, avatar, moods, music genre, notification prefs.
 */

import { create } from 'zustand';

export interface OnboardingState {
    // Step 1 — Name + Avatar + Age
    name: string;
    avatarId: string | null;
    age: string;

    // Step 2 — Personalization Preferences
    primaryReason: string | null;
    relaxationMethods: string[];

    // Step 4 — Notifications
    notifyEnabled: boolean;
    notifyTime: string; // HH:MM format

    // Navigation
    currentStep: number;

    // Actions
    setName: (name: string) => void;
    setAvatarId: (id: string) => void;
    setAge: (age: string) => void;
    setPrimaryReason: (reason: string) => void;
    toggleRelaxationMethod: (method: string) => void;
    setNotifyEnabled: (enabled: boolean) => void;
    setNotifyTime: (time: string) => void;
    setStep: (step: number) => void;
    nextStep: () => void;
    reset: () => void;
}

const initialState = {
    name: '',
    avatarId: null as string | null,
    age: '',
    primaryReason: null as string | null,
    relaxationMethods: [] as string[],
    notifyEnabled: true,
    notifyTime: '08:00',
    currentStep: 1,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
    ...initialState,

    setName: (name) => set({ name }),
    setAvatarId: (avatarId) => set({ avatarId }),
    setAge: (age) => set({ age }),

    setPrimaryReason: (primaryReason) => set({ primaryReason }),

    toggleRelaxationMethod: (method) =>
        set((state) => ({
            relaxationMethods: state.relaxationMethods.includes(method)
                ? state.relaxationMethods.filter((m) => m !== method)
                : [...state.relaxationMethods, method],
        })),

    setNotifyEnabled: (notifyEnabled) => set({ notifyEnabled }),
    setNotifyTime: (notifyTime) => set({ notifyTime }),
    setStep: (currentStep) => set({ currentStep }),
    nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
    reset: () => set(initialState),
}));
