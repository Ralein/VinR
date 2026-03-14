/**
 * Journey Screen — 21-day streak tracker (redesigned)
 *
 * Uses Lucide icons, ProgressRing, and zero emoji throughout.
 * Replaces emoji milestone badges with vector icon badges.
 * Replaces ✓ checkmark text with Lucide Check icon.
 * Replaces 🔥 streak label with Flame icon inline.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
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
import {
    Check, Flame, Leaf, Flower, Trophy, CheckCircle2, ChevronRight,
} from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius, glass } from '../../constants/theme';
import { haptics } from '../../services/haptics';
import { useStreakStore } from '../../stores/streakStore';
import { useActiveStreak, useCompleteDay } from '../../hooks/useStreak';
import { MarkCompleteSheet } from '../../components/streaks/MarkCompleteSheet';
import { MilestoneModal } from '../../components/streaks/MilestoneModal';
import ProgressRing from '../../components/ui/ProgressRing';
import GlassCard from '../../components/ui/GlassCard';

const TOTAL_DAYS = 21;

const MILESTONES = [
    { day: 5,  Icon: Leaf,    label: 'Day 5',  color: colors.emerald },
    { day: 10, Icon: Flower,  label: 'Day 10', color: colors.lavender },
    { day: 15, Icon: Flame,   label: 'Day 15', color: colors.gold },
    { day: 21, Icon: Trophy,  label: 'Day 21', color: '#F5C842' },
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
                    withTiming(0.45, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1, true
            );
        }
    }, [status]);

    const animatedStyle = useAnimatedStyle(() => {
        if (status === 'today') return { opacity: pulseOpacity.value };
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
                <Check size={13} color={colors.gold} strokeWidth={2.5} />
            ) : (
                <Text style={[
                    styles.dayNumber,
                    status === 'today' && styles.dayNumberToday,
                    status === 'future' && styles.dayNumberFuture,
                    status === 'missed' && styles.dayNumberMissed,
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

    useEffect(() => {
        if (milestone) {
            const dayMatch = milestone.match(/(\d+)/);
            if (dayMatch) setMilestoneDay(parseInt(dayMatch[1], 10));
        }
    }, [milestone]);

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
            completeDay.mutate({ streak_id: activeStreakId, reflection_note: reflectionNote, mood_rating: moodRating });
        }
    }, [activeStreakId, completeDay]);

    const handleDismissMilestone = useCallback(() => {
        setMilestoneDay(null);
        setMilestone(null);
    }, [setMilestone]);

    // Empty state
    if (!isLoading && !activeStreakId) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.emptyState}>
                    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyInner}>
                        <View style={styles.emptyIconWrap}>
                            <Flame size={52} color={colors.gold} strokeWidth={1.5} fill={`${colors.gold}30`} />
                        </View>
                        <Text style={styles.emptyTitle}>Your Journey Awaits</Text>
                        <Text style={styles.emptyText}>
                            Complete a check-in and start your 21-day journey to become a winner.
                        </Text>
                        <Pressable
                            style={styles.emptyButton}
                            onPress={() => { haptics.light(); router.push('/(tabs)/checkin'); }}
                        >
                            <Text style={styles.emptyButtonText}>Start a check-in</Text>
                            <ChevronRight size={16} color={colors.void} strokeWidth={2.2} />
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Streak Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <GlassCard accent="gold" elevated shimmer noAnimation>
                        <View style={styles.streakCard}>
                            <View style={styles.streakLeft}>
                                <Text style={styles.streakCount}>{currentStreak}</Text>
                                <View style={styles.streakLabelRow}>
                                    <Text style={styles.streakLabel}>day streak</Text>
                                    <Flame size={16} color={colors.gold} fill={`${colors.gold}40`} strokeWidth={1.5} />
                                </View>
                                {startDate && (
                                    <Text style={styles.startDate}>Started {startDate}</Text>
                                )}
                            </View>
                            <ProgressRing
                                progress={progress}
                                size={88}
                                strokeWidth={7}
                                variant="gold"
                                label={`${totalDaysCompleted}/${TOTAL_DAYS}`}
                                sublabel="days done"
                            />
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* 21-Day Grid */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
                    <Text style={styles.gridTitle}>21-Day Progress</Text>
                    <View style={styles.dayGrid}>
                        {dayStatuses.map((status, index) => (
                            <DayCell key={index} day={index + 1} status={status} />
                        ))}
                    </View>
                </Animated.View>

                {/* Milestone Badges */}
                <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.milestonesRow}>
                    {MILESTONES.map((m) => {
                        const unlocked = totalDaysCompleted >= m.day;
                        const { Icon } = m;
                        return (
                            <View key={m.day} style={[
                                styles.milestoneBadge,
                                unlocked && { borderColor: m.color, backgroundColor: `${m.color}10` },
                            ]}>
                                <View style={[
                                    styles.milestoneIconWrap,
                                    { backgroundColor: `${m.color}${unlocked ? '22' : '0A'}` },
                                ]}>
                                    <Icon
                                        size={20}
                                        color={unlocked ? m.color : colors.textGhost}
                                        strokeWidth={unlocked ? 2 : 1.5}
                                    />
                                </View>
                                <Text style={[
                                    styles.milestoneLabel,
                                    unlocked && { color: m.color, fontFamily: fonts.bodySemiBold },
                                ]}>
                                    {m.label}
                                </Text>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Mark Complete CTA */}
                {!isCompletedToday && activeStreakId && (
                    <Animated.View entering={FadeInDown.delay(700).duration(400)}>
                        <Pressable style={styles.markButton} onPress={handleMarkComplete}>
                            <CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2} />
                            <Text style={styles.markButtonText}>Mark today complete</Text>
                        </Pressable>
                    </Animated.View>
                )}

                {isCompletedToday && (
                    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.completedBanner}>
                        <CheckCircle2 size={24} color={colors.emerald} strokeWidth={2} />
                        <Text style={styles.completedText}>Today is done! See you tomorrow.</Text>
                    </Animated.View>
                )}
            </ScrollView>

            <MarkCompleteSheet
                visible={sheetVisible}
                onConfirm={handleConfirmComplete}
                onClose={() => setSheetVisible(false)}
            />
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
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 60 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyInner: { alignItems: 'center' },
    emptyIconWrap: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: `${colors.gold}10`, alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1, borderColor: `${colors.gold}30`,
    },
    emptyTitle: {
        fontFamily: fonts.display, fontSize: 28,
        color: colors.textPrimary, textAlign: 'center', marginBottom: 12,
    },
    emptyText: {
        fontFamily: fonts.body, fontSize: 15,
        color: colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 28,
    },
    emptyButton: {
        backgroundColor: colors.gold, borderRadius: borderRadius.md,
        paddingVertical: 16, paddingHorizontal: 32,
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    emptyButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.void },
    // Streak Card
    section: { marginTop: spacing.lg },
    streakCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    streakLeft: { flex: 1 },
    streakCount: {
        fontFamily: fonts.displayBlack, fontSize: 64,
        color: colors.gold, lineHeight: 70, letterSpacing: -2,
    },
    streakLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -4 },
    streakLabel: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted },
    startDate: { fontFamily: fonts.bodyLight, fontSize: 12, color: colors.textGhost, marginTop: 4 },
    // Grid
    gridTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 14,
        color: colors.textMuted, marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase',
    },
    dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    dayCell: {
        width: '12%', aspectRatio: 1,
        borderRadius: 10, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5,
    },
    dayCellCompleted: { backgroundColor: `${colors.gold}22`, borderColor: colors.gold },
    dayCellToday: { backgroundColor: `${colors.gold}0A`, borderColor: colors.gold, borderWidth: 2 },
    dayCellMissed: { backgroundColor: `${colors.crimson}08`, borderColor: `${colors.crimson}25` },
    dayCellFuture: { backgroundColor: 'transparent', borderColor: colors.border },
    dayNumber: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
    dayNumberToday: { color: colors.gold, fontFamily: fonts.bodySemiBold },
    dayNumberFuture: { color: colors.textGhost },
    dayNumberMissed: { color: `${colors.crimson}70` },
    // Milestones
    milestonesRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: spacing.lg, marginBottom: spacing.lg,
    },
    milestoneBadge: {
        alignItems: 'center', gap: 6, padding: 10,
        borderRadius: borderRadius.md, borderWidth: 1.5,
        borderColor: colors.border, flex: 1, marginHorizontal: 3,
    },
    milestoneIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    milestoneLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textGhost },
    // Mark Complete
    markButton: {
        backgroundColor: colors.emerald, borderRadius: borderRadius.md,
        paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 10,
        shadowColor: colors.emerald,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    },
    markButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 17, color: '#FFFFFF', letterSpacing: 0.3 },
    // Completed
    completedBanner: {
        backgroundColor: `${colors.emerald}0F`,
        borderRadius: borderRadius.md, padding: 20,
        flexDirection: 'row', alignItems: 'center',
        gap: 12, borderWidth: 1, borderColor: `${colors.emerald}28`,
    },
    completedText: { fontFamily: fonts.body, fontSize: 15, color: colors.emerald, flex: 1 },
});
