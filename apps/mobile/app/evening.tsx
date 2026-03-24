/**
 * Evening Wind-Down Screen v2 — Premium animated experience
 *
 * Sections:
 *  - Starry header with greeting + time chip
 *  - Mood Tap (1–5 with Lucide icons)
 *  - Gratitude prompt card
 *  - Audio categories (sleep, breathing, meditation)
 *  - 4-7-8 Breathing card
 *  - Streak banner
 *  - Habit check (done / tomorrow)
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import {
    ChevronLeft, Moon, Frown, Meh, Smile, SmilePlus, Star,
    Wind, Brain, Headphones, CheckCircle, RefreshCw,
    Quote, Flame, Sparkles, AlarmClock,
} from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../constants/theme';
import { useEveningWindDown } from '../hooks/useRituals';


// ── Types ───────────────────────────────────────────────────

interface MoodOption {
    score: number;
    Icon: any;
    label: string;
    color: string;
}

// ── Data ────────────────────────────────────────────────────

const MOOD_OPTIONS: MoodOption[] = [
    { score: 1, Icon: Frown,     label: 'Rough',  color: '#E05C5C' },
    { score: 2, Icon: Meh,       label: 'Meh',    color: colors.gold },
    { score: 3, Icon: Smile,     label: 'Okay',   color: '#4DB6A9' },
    { score: 4, Icon: SmilePlus, label: 'Good',   color: '#5B8CF5' },
    { score: 5, Icon: Star,      label: 'Great',  color: '#B07FE0' },
];



// ── Mood chip with spring animation ─────────────────────────

function MoodChip({ option, selected, onPress }: {
    option: MoodOption;
    selected: boolean;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 320, damping: 18 }) }],
    }));
    const { Icon } = option;

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.92; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={onPress}
            style={{ flex: 1 }}
        >
            <Animated.View
                style={[
                    styles.moodChip,
                    selected && { borderColor: option.color, backgroundColor: `${option.color}15` },
                    animStyle,
                ]}
            >
                <Icon
                    size={22}
                    color={selected ? option.color : colors.textGhost}
                    strokeWidth={1.8}
                />
                <Text style={[styles.moodLabel, selected && { color: option.color }]}>
                    {option.label}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

// ── Breathing card ──────────────────────────────────────────

function BreathingCard({ name, instructions, onPress }: {
    name: string;
    instructions?: string;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 300, damping: 20 }) }],
    }));

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.98; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={onPress}
        >
            <Animated.View style={[styles.breathingCard, animStyle]}>
                <View style={styles.breathingCircle}>
                    <Wind size={20} color={colors.sapphire} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.breathingName}>{name}</Text>
                    {instructions ? (
                        <Text style={styles.breathingDesc} numberOfLines={2}>
                            {instructions}
                        </Text>
                    ) : null}
                </View>
                <View style={styles.breathingBadge}>
                    <AlarmClock size={11} color={colors.sapphire} strokeWidth={2} />
                    <Text style={styles.breathingBadgeText}>5 min</Text>
                </View>
            </Animated.View>
        </Pressable>
    );
}

// ── Main Screen ─────────────────────────────────────────────

export default function EveningScreen() {
    const router = useRouter();
    const { data, isLoading, error } = useEveningWindDown();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [habitDone, setHabitDone] = useState<boolean | null>(null);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.gold} />
                    <Text style={styles.loadingText}>Preparing your wind-down...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ───────────────────────────────────── */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={20} color={colors.gold} strokeWidth={2} />
                        <Text style={styles.backText}>Back</Text>
                    </Pressable>

                    <View style={styles.headerHero}>
                        <View style={styles.moonCircle}>
                            <Moon size={28} color={colors.sapphire} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.greeting}>
                            {data?.greeting ?? 'Good evening.'}
                        </Text>
                        <Text style={styles.subtitle}>Time to wind down.</Text>
                    </View>
                </Animated.View>

                {/* ── Mood Tap ─────────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <Sparkles size={13} color={colors.gold} strokeWidth={2} />
                        <Text style={styles.sectionLabel}>HOW DID YOUR DAY GO?</Text>
                    </View>
                    <View style={styles.moodRow}>
                        {MOOD_OPTIONS.map((opt) => (
                            <MoodChip
                                key={opt.score}
                                option={opt}
                                selected={selectedMood === opt.score}
                                onPress={() => setSelectedMood(opt.score)}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* ── Gratitude Prompt ─────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(220).duration(500)} style={styles.section}>
                    <View style={styles.gratitudeCard}>
                        <View style={styles.gratitudeLabelRow}>
                            <Quote size={13} color={colors.gold} strokeWidth={2} />
                            <Text style={styles.gratitudeLabel}>TONIGHT'S REFLECTION</Text>
                        </View>
                        <Text style={styles.gratitudePrompt}>
                            {data?.gratitude_prompt ?? 'What went well today, even if it was small?'}
                        </Text>
                    </View>
                </Animated.View>




                {/* ── Breathing Exercise ───────────────────────── */}
                <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <Wind size={13} color={colors.sapphire} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.sapphire }]}>SLEEP BREATHING</Text>
                    </View>
                    <BreathingCard
                        name={data?.breathing_suggestion?.name ?? '4-7-8 Sleep Breath'}
                        instructions={data?.breathing_suggestion?.instructions}
                        onPress={() => router.push('/breathing')}
                    />
                </Animated.View>

                {/* ── Habit Check ──────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(520).duration(500)} style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <CheckCircle size={13} color={colors.emerald} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.emerald }]}>TODAY'S HABIT</Text>
                    </View>
                    <View style={styles.habitRow}>
                        <Pressable
                            style={[
                                styles.habitBtn,
                                habitDone === true && styles.habitBtnDone,
                            ]}
                            onPress={() => setHabitDone(true)}
                        >
                            <CheckCircle
                                size={18}
                                color={habitDone === true ? colors.emerald : colors.textGhost}
                                strokeWidth={2}
                            />
                            <Text
                                style={[
                                    styles.habitBtnText,
                                    habitDone === true && { color: colors.emerald },
                                ]}
                            >
                                Yes, I did it!
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.habitBtn,
                                habitDone === false && styles.habitBtnTomorrow,
                            ]}
                            onPress={() => setHabitDone(false)}
                        >
                            <RefreshCw
                                size={18}
                                color={habitDone === false ? colors.gold : colors.textGhost}
                                strokeWidth={2}
                            />
                            <Text
                                style={[
                                    styles.habitBtnText,
                                    habitDone === false && { color: colors.gold },
                                ]}
                            >
                                Tomorrow
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>

                {/* ── Streak Banner ────────────────────────────── */}
                {(data?.current_streak ?? 0) > 0 && (
                    <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.streakBanner}>
                        <Flame size={18} color={colors.gold} strokeWidth={2} />
                        <Text style={styles.streakText}>
                            {data!.current_streak} day streak — rest well, champion.
                        </Text>
                    </Animated.View>
                )}

                {/* ── Error state ──────────────────────────────── */}
                {error && !data && (
                    <Animated.View entering={FadeIn.duration(400)} style={styles.errorCard}>
                        <Text style={styles.errorText}>
                            Unable to load your wind-down. Check your connection.
                        </Text>
                    </Animated.View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
    },
    scroll: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
    },

    // Header
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.xl,
    },
    backText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        color: colors.gold,
    },
    headerHero: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    moonCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${colors.sapphire}18`,
        borderWidth: 1,
        borderColor: `${colors.sapphire}30`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        shadowColor: colors.sapphire,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 6,
    },
    greeting: {
        fontFamily: fonts.display,
        fontSize: 30,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: fonts.italic,
        fontSize: 15,
        color: colors.textMuted,
        textAlign: 'center',
    },

    // Sections
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.md,
    },
    sectionLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.gold,
        letterSpacing: 1.4,
    },

    // Mood
    moodRow: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    moodChip: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: 4,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 5,
    },
    moodLabel: {
        fontFamily: fonts.body,
        fontSize: 10,
        color: colors.textGhost,
    },

    // Gratitude
    gratitudeCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: `${colors.gold}20`,
    },
    gratitudeLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.sm,
    },
    gratitudeLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.gold,
        letterSpacing: 1.4,
    },
    gratitudePrompt: {
        fontFamily: fonts.italic,
        fontSize: 18,
        color: colors.textPrimary,
        lineHeight: 27,
    },

    // Breathing
    breathingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: `${colors.sapphire}25`,
        gap: spacing.md,
    },
    breathingCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${colors.sapphire}15`,
        borderWidth: 1.5,
        borderColor: `${colors.sapphire}40`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    breathingName: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.textPrimary,
    },
    breathingDesc: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 3,
    },
    breathingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: `${colors.sapphire}15`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    breathingBadgeText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.sapphire,
    },

    // Habit check
    habitRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    habitBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    habitBtnDone: {
        borderColor: colors.emerald,
        backgroundColor: `${colors.emerald}10`,
    },
    habitBtnTomorrow: {
        borderColor: `${colors.gold}60`,
        backgroundColor: `${colors.gold}08`,
    },
    habitBtnText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
        color: colors.textMuted,
    },

    // Streak banner
    streakBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: `${colors.gold}08`,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: `${colors.gold}20`,
    },
    streakText: {
        fontFamily: fonts.italic,
        fontSize: 14,
        color: colors.textMuted,
    },

    // Error
    errorCard: {
        marginHorizontal: spacing.lg,
        padding: spacing.lg,
        backgroundColor: `#E05C5C15`,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: `#E05C5C30`,
    },
    errorText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: '#E05C5C',
        textAlign: 'center',
    },
});
