/**
 * Evening Wind-Down Screen — Mood tap, habit check, sleep music, breathing
 *
 * Accessible 8–11 PM via Home navigation
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius } from '../constants/theme';
import { useEveningWindDown } from '../hooks/useRituals';

const MOOD_OPTIONS = [
    { score: 1, emoji: '😔', label: 'Rough' },
    { score: 2, emoji: '😐', label: 'Meh' },
    { score: 3, emoji: '🙂', label: 'Okay' },
    { score: 4, emoji: '😊', label: 'Good' },
    { score: 5, emoji: '🤩', label: 'Great' },
];

export default function EveningScreen() {
    const router = useRouter();
    const { data, isLoading } = useEveningWindDown();
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
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>

                {/* Greeting */}
                <Text style={styles.greeting}>{data?.greeting || 'Good evening.'}</Text>
                <Text style={styles.subtitle}>Time to wind down 🌙</Text>

                {/* Quick Mood Tap */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How did your day go?</Text>
                    <View style={styles.moodRow}>
                        {MOOD_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.score}
                                style={[
                                    styles.moodChip,
                                    selectedMood === opt.score && styles.moodChipActive,
                                ]}
                                onPress={() => setSelectedMood(opt.score)}
                            >
                                <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                                <Text
                                    style={[
                                        styles.moodLabel,
                                        selectedMood === opt.score && styles.moodLabelActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Habit Check */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Did you complete today's habit?</Text>
                    <View style={styles.habitCheckRow}>
                        <Pressable
                            style={[
                                styles.habitCheckButton,
                                habitDone === true && styles.habitCheckActive,
                            ]}
                            onPress={() => setHabitDone(true)}
                        >
                            <Text style={styles.habitCheckEmoji}>✅</Text>
                            <Text
                                style={[
                                    styles.habitCheckText,
                                    habitDone === true && styles.habitCheckTextActive,
                                ]}
                            >
                                Yes!
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.habitCheckButton,
                                habitDone === false && styles.habitCheckMissed,
                            ]}
                            onPress={() => setHabitDone(false)}
                        >
                            <Text style={styles.habitCheckEmoji}>🔄</Text>
                            <Text style={styles.habitCheckText}>Tomorrow</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Gratitude Prompt */}
                <View style={styles.gratitudeCard}>
                    <Text style={styles.gratitudeLabel}>Tonight's Reflection</Text>
                    <Text style={styles.gratitudePrompt}>
                        {data?.gratitude_prompt || 'What went well today?'}
                    </Text>
                </View>

                {/* Sleep Music Suggestion */}
                {data?.sleep_suggestion && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🌙 Sleep Music</Text>
                        <Pressable
                            style={styles.sleepCard}
                            onPress={() => router.push('/(tabs)/index')}
                        >
                            <Text style={styles.sleepEmoji}>🎵</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sleepText}>
                                    {data.sleep_suggestion.message}
                                </Text>
                            </View>
                            <Text style={styles.sleepArrow}>→</Text>
                        </Pressable>
                    </View>
                )}

                {/* 4-7-8 Breathing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🫁 Sleep Breathing</Text>
                    <Pressable
                        style={styles.breathingCard}
                        onPress={() => router.push('/breathing')}
                    >
                        <View style={styles.breathingCircle}>
                            <Text style={styles.breathingCircleText}>4-7-8</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.breathingName}>
                                {data?.breathing_suggestion?.name || '4-7-8 Sleep Breath'}
                            </Text>
                            <Text style={styles.breathingDesc}>
                                {data?.breathing_suggestion?.instructions}
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* Streak Summary */}
                {data && data.current_streak > 0 && (
                    <View style={styles.streakBanner}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <Text style={styles.streakText}>
                            {data.current_streak} day streak — rest well, champion.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    scroll: { paddingBottom: 100 },
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    loadingText: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted, marginTop: spacing.md,
    },
    backButton: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    backText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.gold },
    greeting: {
        fontFamily: fonts.display, fontSize: 32,
        color: colors.textPrimary,
        paddingHorizontal: spacing.lg, marginTop: spacing.md,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 15,
        color: colors.textMuted,
        paddingHorizontal: spacing.lg, marginTop: spacing.xs,
        marginBottom: spacing.xl,
    },
    section: {
        paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: fonts.display, fontSize: 20,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    moodRow: {
        flexDirection: 'row', justifyContent: 'space-between',
    },
    moodChip: {
        alignItems: 'center', paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm, borderRadius: borderRadius.md,
        backgroundColor: colors.surface, borderWidth: 1,
        borderColor: colors.border, flex: 1, marginHorizontal: 3,
    },
    moodChipActive: {
        borderColor: colors.gold, backgroundColor: colors.goldGlow,
    },
    moodEmoji: { fontSize: 24, marginBottom: 4 },
    moodLabel: {
        fontFamily: fonts.body, fontSize: 11, color: colors.textMuted,
    },
    moodLabelActive: { color: colors.gold },
    habitCheckRow: {
        flexDirection: 'row', gap: spacing.md,
    },
    habitCheckButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: spacing.sm,
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        paddingVertical: spacing.md, borderWidth: 1,
        borderColor: colors.border,
    },
    habitCheckActive: {
        borderColor: colors.emerald, backgroundColor: colors.emerald + '10',
    },
    habitCheckMissed: {
        borderColor: colors.gold + '40', backgroundColor: colors.goldGlow,
    },
    habitCheckEmoji: { fontSize: 20 },
    habitCheckText: {
        fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.textMuted,
    },
    habitCheckTextActive: { color: colors.emerald },
    gratitudeCard: {
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.lg, borderWidth: 1,
        borderColor: colors.gold + '20',
    },
    gratitudeLabel: {
        fontFamily: fonts.bodySemiBold, fontSize: 12,
        color: colors.gold, textTransform: 'uppercase',
        letterSpacing: 1.5, marginBottom: spacing.sm,
    },
    gratitudePrompt: {
        fontFamily: fonts.italic, fontSize: 18,
        color: colors.textPrimary, lineHeight: 26,
    },
    sleepCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, gap: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    sleepEmoji: { fontSize: 24 },
    sleepText: {
        fontFamily: fonts.body, fontSize: 14, color: colors.textMuted,
    },
    sleepArrow: {
        fontFamily: fonts.bodySemiBold, fontSize: 18, color: colors.gold,
    },
    breathingCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.md, gap: spacing.md,
        borderWidth: 1, borderColor: colors.sapphire + '30',
    },
    breathingCircle: {
        width: 52, height: 52, borderRadius: 26,
        borderWidth: 2, borderColor: colors.sapphire,
        alignItems: 'center', justifyContent: 'center',
    },
    breathingCircleText: {
        fontFamily: fonts.mono, fontSize: 12, color: colors.sapphire,
    },
    breathingName: {
        fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.textPrimary,
    },
    breathingDesc: {
        fontFamily: fonts.body, fontSize: 13, color: colors.textMuted,
        marginTop: 2,
    },
    streakBanner: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        justifyContent: 'center', gap: spacing.sm,
        paddingVertical: spacing.md,
    },
    streakEmoji: { fontSize: 20 },
    streakText: {
        fontFamily: fonts.italic, fontSize: 15, color: colors.textMuted,
    },
});
