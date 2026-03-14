/**
 * Journey Screen — 21-day streak tracker
 *
 * Streak counter, 21-day grid (7×3), progress bar,
 * milestone badges, habit reminder, mark complete CTA.
 */

import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { haptics } from '../../services/haptics';
import { useStreakStore } from '../../stores/streakStore';
import { useActiveStreak, useCompleteDay } from '../../hooks/useStreak';
import { MarkCompleteSheet } from '../../components/streaks/MarkCompleteSheet';
import { MilestoneModal } from '../../components/streaks/MilestoneModal';

const TOTAL_DAYS = 21;

const MILESTONES = [
    { day: 5, emoji: '🌱', label: '5' },
    { day: 10, emoji: '🌿', label: '10' },
    { day: 15, emoji: '🌸', label: '15' },
    { day: 21, emoji: '🏆', label: '21' },
];

function DayCell({ day, status }: {
    day: number;
    status: 'completed' | 'today' | 'missed' | 'future';
}) {
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (status === 'today') {
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1, true
            );
        }
    }, [status]);

    const animatedStyle = useAnimatedStyle(() => {
        if (status === 'today') {
            return { opacity: pulseOpacity.value };
        }
        return {};
    });

    const cellStyle = [
        styles.dayCell,
        status === 'completed' && styles.dayCellCompleted,
        status === 'today' && styles.dayCellToday,
        status === 'missed' && styles.dayCellMissed,
        status === 'future' && styles.dayCellFuture,
    ];

    return (
        <Animated.View style={[cellStyle, status === 'today' && animatedStyle]}>
            {status === 'completed' ? (
                <Text style={styles.dayCheck}>✓</Text>
            ) : (
                <Text style={[
                    styles.dayNumber,
                    status === 'today' && styles.dayNumberToday,
                    status === 'future' && styles.dayNumberFuture,
                ]}>
                    {day}
                </Text>
            )}
        </Animated.View>
    );
}

export default function JourneyScreen() {
    const {
        activeStreakId, currentStreak, totalDaysCompleted,
        startDate, dailyCompletions, isCompletedToday, milestone,
        setMilestone,
    } = useStreakStore();

    const { isLoading } = useActiveStreak();
    const completeDay = useCompleteDay();

    const [sheetVisible, setSheetVisible] = useState(false);
    const [milestoneDay, setMilestoneDay] = useState<number | null>(null);

    // Show milestone modal when detected
    useEffect(() => {
        if (milestone) {
            // Parse milestone day from the streak store
            const dayMatch = milestone.match(/(\d+)/);
            if (dayMatch) {
                setMilestoneDay(parseInt(dayMatch[1], 10));
            }
        }
    }, [milestone]);

    // Build day statuses for the 21-day grid
    const dayStatuses = useMemo(() => {
        const completedDays = new Set(dailyCompletions.map((c) => c.dayNumber));
        const statuses: Array<'completed' | 'today' | 'missed' | 'future'> = [];

        for (let i = 1; i <= TOTAL_DAYS; i++) {
            if (completedDays.has(i)) {
                statuses.push('completed');
            } else if (i === totalDaysCompleted + 1) {
                statuses.push(isCompletedToday ? 'completed' : 'today');
            } else if (i < totalDaysCompleted + 1) {
                statuses.push('missed');
            } else {
                statuses.push('future');
            }
        }
        return statuses;
    }, [dailyCompletions, totalDaysCompleted, isCompletedToday]);

    const progress = Math.min(totalDaysCompleted / TOTAL_DAYS, 1);

    const handleMarkComplete = useCallback(() => {
        haptics.medium();
        setSheetVisible(true);
    }, []);

    const handleConfirmComplete = useCallback((reflectionNote: string | null, moodRating: number | null) => {
        setSheetVisible(false);
        if (activeStreakId) {
            completeDay.mutate({
                streak_id: activeStreakId,
                reflection_note: reflectionNote,
                mood_rating: moodRating,
            });
        }
    }, [activeStreakId, completeDay]);

    const handleDismissMilestone = useCallback(() => {
        setMilestoneDay(null);
        setMilestone(null);
    }, [setMilestone]);

    // Empty state — no active streak
    if (!isLoading && !activeStreakId) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyState}>
                    <Animated.View entering={FadeIn.duration(600)}>
                        <Text style={styles.emptyEmoji}>🔥</Text>
                        <Text style={styles.emptyTitle}>Your Journey Awaits</Text>
                        <Text style={styles.emptyText}>
                            Complete a check-in and start your 21-day journey to become a winner.
                        </Text>
                        <Pressable
                            style={styles.emptyButton}
                            onPress={() => { haptics.light(); router.push('/(tabs)/checkin'); }}
                        >
                            <Text style={styles.emptyButtonText}>Start a check-in →</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Streak Counter */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.streakHeader}>
                    <Text style={styles.streakCount}>{currentStreak}</Text>
                    <Text style={styles.streakLabel}>day streak 🔥</Text>
                    {startDate && (
                        <Text style={styles.startDate}>Started {startDate}</Text>
                    )}
                </Animated.View>

                {/* 21-Day Grid */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                    <Text style={styles.gridTitle}>21-Day Progress</Text>
                    <View style={styles.dayGrid}>
                        {dayStatuses.map((status, index) => (
                            <DayCell key={index} day={index + 1} status={status} />
                        ))}
                    </View>
                </Animated.View>

                {/* Progress Bar */}
                <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.progressWrap}>
                    <View style={styles.progressTrack}>
                        <Animated.View
                            style={[styles.progressFill, { width: `${progress * 100}%` }]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {totalDaysCompleted}/{TOTAL_DAYS} days
                    </Text>
                </Animated.View>

                {/* Milestone Badges */}
                <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.milestonesRow}>
                    {MILESTONES.map((m) => {
                        const unlocked = totalDaysCompleted >= m.day;
                        return (
                            <View key={m.day} style={[
                                styles.milestoneBadge,
                                unlocked && styles.milestoneBadgeUnlocked,
                            ]}>
                                <Text style={[styles.milestoneEmoji, !unlocked && { opacity: 0.3 }]}>
                                    {m.emoji}
                                </Text>
                                <Text style={[
                                    styles.milestoneLabel,
                                    unlocked && styles.milestoneLabelUnlocked,
                                ]}>
                                    {m.label}
                                </Text>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Mark Complete CTA */}
                {!isCompletedToday && activeStreakId && (
                    <Animated.View entering={FadeInDown.delay(800).duration(400)}>
                        <Pressable style={styles.markButton} onPress={handleMarkComplete}>
                            <Text style={styles.markButtonText}>Mark today complete ✓</Text>
                        </Pressable>
                    </Animated.View>
                )}

                {isCompletedToday && (
                    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.completedBanner}>
                        <Text style={styles.completedEmoji}>✨</Text>
                        <Text style={styles.completedText}>Today is done! See you tomorrow.</Text>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Mark Complete Bottom Sheet */}
            <MarkCompleteSheet
                visible={sheetVisible}
                onConfirm={handleConfirmComplete}
                onClose={() => setSheetVisible(false)}
            />

            {/* Milestone Celebration */}
            <MilestoneModal
                day={milestoneDay}
                visible={milestoneDay !== null}
                onDismiss={handleDismissMilestone}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 48,
    },
    // Empty State
    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
    },
    emptyEmoji: { fontSize: 64, textAlign: 'center', marginBottom: 20 },
    emptyTitle: {
        fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28,
        color: colors.textPrimary, textAlign: 'center', marginBottom: 12,
    },
    emptyText: {
        fontFamily: 'DMSans_400Regular', fontSize: 16,
        color: colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 28,
    },
    emptyButton: {
        backgroundColor: colors.gold, borderRadius: 14,
        paddingVertical: 16, paddingHorizontal: 32, alignSelf: 'center',
    },
    emptyButtonText: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: colors.void,
    },
    // Streak Header
    streakHeader: { alignItems: 'center', marginBottom: 32 },
    streakCount: {
        fontFamily: 'PlayfairDisplay_700Bold', fontSize: 72,
        color: colors.gold, lineHeight: 80,
    },
    streakLabel: {
        fontFamily: 'DMSans_400Regular', fontSize: 18,
        color: colors.textMuted, marginBottom: 4,
    },
    startDate: {
        fontFamily: 'DMSans_300Light', fontSize: 13,
        color: colors.textGhost,
    },
    // Grid
    gridTitle: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 15,
        color: colors.textMuted, marginBottom: 14,
    },
    dayGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: 8, marginBottom: 24,
    },
    dayCell: {
        width: '12.5%', aspectRatio: 1,
        borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5,
    },
    dayCellCompleted: {
        backgroundColor: 'rgba(212,168,83,0.2)',
        borderColor: colors.gold,
    },
    dayCellToday: {
        backgroundColor: 'rgba(212,168,83,0.08)',
        borderColor: colors.gold, borderWidth: 2,
    },
    dayCellMissed: {
        backgroundColor: 'rgba(232,93,93,0.08)',
        borderColor: 'rgba(232,93,93,0.2)',
    },
    dayCellFuture: {
        backgroundColor: 'transparent',
        borderColor: colors.border,
    },
    dayCheck: {
        fontSize: 14, color: colors.gold, fontWeight: '700',
    },
    dayNumber: {
        fontFamily: 'DMSans_400Regular', fontSize: 12,
        color: colors.textMuted,
    },
    dayNumberToday: { color: colors.gold, fontWeight: '600' },
    dayNumberFuture: { color: colors.textGhost },
    // Progress Bar
    progressWrap: { marginBottom: 28 },
    progressTrack: {
        height: 8, borderRadius: 4,
        backgroundColor: colors.surface,
        overflow: 'hidden', marginBottom: 8,
    },
    progressFill: {
        height: '100%', borderRadius: 4,
        backgroundColor: colors.gold,
    },
    progressText: {
        fontFamily: 'DMSans_300Light', fontSize: 13,
        color: colors.textGhost, textAlign: 'right',
    },
    // Milestones
    milestonesRow: {
        flexDirection: 'row', justifyContent: 'space-around',
        marginBottom: 32,
    },
    milestoneBadge: {
        alignItems: 'center', padding: 10,
        borderRadius: 16, borderWidth: 1.5,
        borderColor: colors.border, minWidth: 60,
    },
    milestoneBadgeUnlocked: {
        borderColor: colors.gold,
        backgroundColor: 'rgba(212,168,83,0.08)',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    milestoneEmoji: { fontSize: 24, marginBottom: 4 },
    milestoneLabel: {
        fontFamily: 'DMSans_400Regular', fontSize: 12,
        color: colors.textGhost,
    },
    milestoneLabelUnlocked: { color: colors.gold, fontWeight: '600' },
    // Mark Complete
    markButton: {
        backgroundColor: colors.emerald, borderRadius: 14,
        paddingVertical: 18, alignItems: 'center',
        shadowColor: colors.emerald,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    },
    markButtonText: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 17,
        color: '#FFFFFF', letterSpacing: 0.3,
    },
    // Completed
    completedBanner: {
        backgroundColor: 'rgba(78,203,160,0.1)',
        borderRadius: 14, padding: 20,
        flexDirection: 'row', alignItems: 'center',
        gap: 12, borderWidth: 1,
        borderColor: 'rgba(78,203,160,0.2)',
    },
    completedEmoji: { fontSize: 28 },
    completedText: {
        fontFamily: 'DMSans_400Regular', fontSize: 15,
        color: colors.emerald, flex: 1,
    },
});
