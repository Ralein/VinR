/**
 * Notification Settings Screen
 * Toggle notification types, set reminder time, snooze
 */

import { useState } from 'react';
import {
    View, Text, StyleSheet, Switch, Pressable,
    ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';

const NOTIFICATION_TYPES = [
    {
        key: 'daily_reminder_enabled' as const,
        title: 'Daily Reminder',
        description: 'Gentle nudge at your chosen time to check in',
        emoji: '⏰',
    },
    {
        key: 'streak_at_risk_enabled' as const,
        title: 'Streak at Risk',
        description: 'Warning at 11 PM if you haven\'t completed today',
        emoji: '⚠️',
    },
    {
        key: 'milestone_enabled' as const,
        title: 'Milestone Celebrations',
        description: 'Celebrate when you hit 5, 10, 15, and 21 days',
        emoji: '🏆',
    },
    {
        key: 're_engagement_enabled' as const,
        title: 'Come Back Nudge',
        description: 'If we haven\'t heard from you in a few days',
        emoji: '💙',
    },
];

const REMINDER_TIMES = [
    { label: '6:00 AM', value: '06:00:00' },
    { label: '7:00 AM', value: '07:00:00' },
    { label: '8:00 AM', value: '08:00:00' },
    { label: '9:00 AM', value: '09:00:00' },
    { label: '10:00 AM', value: '10:00:00' },
    { label: '12:00 PM', value: '12:00:00' },
    { label: '6:00 PM', value: '18:00:00' },
    { label: '8:00 PM', value: '20:00:00' },
];

export default function NotificationSettingsScreen() {
    const {
        preferences,
        isLoading,
        updatePreferences,
        isUpdating,
        snooze,
        isSnoozeing,
    } = useNotificationSettings();

    const [showTimePicker, setShowTimePicker] = useState(false);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.gold} />
                </View>
            </SafeAreaView>
        );
    }

    const currentTime = preferences?.daily_reminder_time || '08:00:00';
    const currentTimeLabel = REMINDER_TIMES.find(t => t.value === currentTime)?.label || '8:00 AM';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </Pressable>
                    <Text style={styles.title}>Notifications</Text>
                    <Text style={styles.subtitle}>
                        Choose how VinR checks on you
                    </Text>
                </View>

                {/* Snooze Banner */}
                {preferences?.snooze_until && new Date(preferences.snooze_until) > new Date() && (
                    <View style={styles.snoozeBanner}>
                        <Text style={styles.snoozeEmoji}>😴</Text>
                        <Text style={styles.snoozeText}>
                            Notifications snoozed until{' '}
                            {new Date(preferences.snooze_until).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>
                )}

                {/* Notification Toggles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Types</Text>
                    {NOTIFICATION_TYPES.map((type) => (
                        <View key={type.key} style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleEmoji}>{type.emoji}</Text>
                                <View style={styles.toggleText}>
                                    <Text style={styles.toggleTitle}>{type.title}</Text>
                                    <Text style={styles.toggleDescription}>
                                        {type.description}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={preferences?.[type.key] ?? true}
                                onValueChange={(value) =>
                                    updatePreferences({ [type.key]: value })
                                }
                                trackColor={{ false: colors.surface, true: colors.gold }}
                                thumbColor={colors.textPrimary}
                                disabled={isUpdating}
                            />
                        </View>
                    ))}
                </View>

                {/* Reminder Time */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily Reminder Time</Text>
                    <Pressable
                        style={styles.timePickerButton}
                        onPress={() => setShowTimePicker(!showTimePicker)}
                    >
                        <Text style={styles.timePickerLabel}>Remind me at</Text>
                        <Text style={styles.timePickerValue}>{currentTimeLabel}</Text>
                    </Pressable>

                    {showTimePicker && (
                        <View style={styles.timeGrid}>
                            {REMINDER_TIMES.map((time) => (
                                <Pressable
                                    key={time.value}
                                    style={[
                                        styles.timeChip,
                                        currentTime === time.value && styles.timeChipActive,
                                    ]}
                                    onPress={() => {
                                        updatePreferences({ daily_reminder_time: time.value });
                                        setShowTimePicker(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.timeChipText,
                                            currentTime === time.value && styles.timeChipTextActive,
                                        ]}
                                    >
                                        {time.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Snooze */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Need a Break?</Text>
                    <Pressable
                        style={styles.snoozeButton}
                        onPress={() => snooze(2)}
                        disabled={isSnoozeing}
                    >
                        <Text style={styles.snoozeButtonEmoji}>😴</Text>
                        <Text style={styles.snoozeButtonText}>
                            Snooze for 2 hours
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { padding: spacing.lg },

    // Header
    header: { marginBottom: spacing.xl },
    backButton: { marginBottom: spacing.md },
    backText: { fontFamily: fonts.body, fontSize: 16, color: colors.gold },
    title: {
        fontFamily: fonts.display, fontSize: 32,
        color: colors.textPrimary, marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 16,
        color: colors.textMuted,
    },

    // Snooze Banner
    snoozeBanner: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.elevated, borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.lg,
        borderWidth: 1, borderColor: colors.gold + '30',
    },
    snoozeEmoji: { fontSize: 24, marginRight: spacing.sm },
    snoozeText: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted, flex: 1,
    },

    // Section
    section: { marginBottom: spacing.xl },
    sectionTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 14,
        color: colors.textMuted, textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: spacing.md,
    },

    // Toggle Row
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    toggleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.md },
    toggleEmoji: { fontSize: 24, marginRight: spacing.sm },
    toggleText: { flex: 1 },
    toggleTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 16,
        color: colors.textPrimary, marginBottom: 2,
    },
    toggleDescription: {
        fontFamily: fonts.body, fontSize: 13,
        color: colors.textMuted,
    },

    // Time Picker
    timePickerButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    },
    timePickerLabel: {
        fontFamily: fonts.body, fontSize: 16, color: colors.textPrimary,
    },
    timePickerValue: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.gold,
    },
    timeGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        marginTop: spacing.sm, gap: spacing.sm,
    },
    timeChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        backgroundColor: colors.surface, borderRadius: borderRadius.full,
        borderWidth: 1, borderColor: colors.border,
    },
    timeChipActive: {
        backgroundColor: colors.gold + '20', borderColor: colors.gold,
    },
    timeChipText: {
        fontFamily: fonts.body, fontSize: 14, color: colors.textMuted,
    },
    timeChipTextActive: {
        fontFamily: fonts.bodySemiBold, color: colors.gold,
    },

    // Snooze Button
    snoozeButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    },
    snoozeButtonEmoji: { fontSize: 20, marginRight: spacing.sm },
    snoozeButtonText: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.textPrimary,
    },
});
