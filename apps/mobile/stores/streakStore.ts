/**
 * Zustand Streak Store
 */

import { create } from 'zustand';

interface DailyCompletion {
    id: string;
    dayNumber: number;
    completedAt: string;
    reflectionNote: string | null;
    moodRating: number | null;
}

interface StreakState {
    activeStreakId: string | null;
    currentStreak: number;
    longestStreak: number;
    totalDaysCompleted: number;
    startDate: string | null;
    dailyCompletions: DailyCompletion[];
    isCompletedToday: boolean;
    milestone: string | null;

    setActiveStreak: (data: {
        id: string;
        currentStreak: number;
        longestStreak: number;
        totalDaysCompleted: number;
        startDate: string;
        dailyCompletions: DailyCompletion[];
    }) => void;
    markDayComplete: (completion: DailyCompletion) => void;
    setMilestone: (milestone: string | null) => void;
    reset: () => void;
}

export const useStreakStore = create<StreakState>((set) => ({
    activeStreakId: null,
    currentStreak: 0,
    longestStreak: 0,
    totalDaysCompleted: 0,
    startDate: null,
    dailyCompletions: [],
    isCompletedToday: false,
    milestone: null,

    setActiveStreak: (data) =>
        set({
            activeStreakId: data.id,
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
            totalDaysCompleted: data.totalDaysCompleted,
            startDate: data.startDate,
            dailyCompletions: data.dailyCompletions,
        }),

    markDayComplete: (completion) =>
        set((state) => ({
            dailyCompletions: [...state.dailyCompletions, completion],
            currentStreak: state.currentStreak + 1,
            totalDaysCompleted: state.totalDaysCompleted + 1,
            isCompletedToday: true,
        })),

    setMilestone: (milestone) => set({ milestone }),

    reset: () =>
        set({
            activeStreakId: null,
            currentStreak: 0,
            longestStreak: 0,
            totalDaysCompleted: 0,
            startDate: null,
            dailyCompletions: [],
            isCompletedToday: false,
            milestone: null,
        }),
}));
