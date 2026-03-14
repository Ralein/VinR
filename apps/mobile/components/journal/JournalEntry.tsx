/**
 * JournalEntry v2 — Emoji-free, premium display card
 *
 * Mood displayed as a colored Lucide icon badge.
 * AI response section has Sparkles icon label.
 * Press ripple via Animated.View scale.
 */

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { Frown, Meh, Smile, SmilePlus, Star, Sparkles, ChevronRight } from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';

const MOOD_CONFIG: Record<number, { Icon: typeof Smile; color: string; label: string }> = {
    1: { Icon: Frown,     color: '#E85D5D', label: 'Low'     },
    2: { Icon: Meh,       color: '#D4A853', label: 'Okay'    },
    3: { Icon: Smile,     color: '#4ECBA0', label: 'Good'    },
    4: { Icon: SmilePlus, color: '#4A90D9', label: 'Great'   },
    5: { Icon: Star,      color: '#8B7EC8', label: 'Amazing' },
};

interface JournalEntryProps {
    entry: {
        id: string;
        date: string;
        gratitude_items: string[];
        reflection_text: string | null;
        mood_at_entry: number | null;
        ai_response: string | null;
    };
    onPress?: () => void;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
    });
}

export default function JournalEntry({ entry, onPress }: JournalEntryProps) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 300, damping: 20 }) }],
    }));

    const moodCfg = entry.mood_at_entry ? MOOD_CONFIG[entry.mood_at_entry] : null;

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.975; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={onPress}
        >
            <Animated.View style={[styles.container, animStyle]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.dateRow}>
                        <View style={styles.dateDot} />
                        <Text style={styles.date}>{formatDate(entry.date)}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {moodCfg && (
                            <View style={[styles.moodBadge, { backgroundColor: `${moodCfg.color}15`, borderColor: `${moodCfg.color}30` }]}>
                                <moodCfg.Icon size={13} color={moodCfg.color} strokeWidth={2} />
                                <Text style={[styles.moodBadgeText, { color: moodCfg.color }]}>{moodCfg.label}</Text>
                            </View>
                        )}
                        <ChevronRight size={14} color={colors.textGhost} strokeWidth={1.5} />
                    </View>
                </View>

                {/* Gratitude bullets */}
                <View style={styles.gratitudeList}>
                    {entry.gratitude_items.map((item, i) => (
                        <View key={i} style={styles.gratitudeRow}>
                            <View style={styles.bullet} />
                            <Text style={styles.gratitudeText} numberOfLines={1}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Reflection preview */}
                {entry.reflection_text && (
                    <Text style={styles.reflectionPreview} numberOfLines={2}>
                        {entry.reflection_text}
                    </Text>
                )}

                {/* AI response */}
                {entry.ai_response && (
                    <View style={styles.aiPreview}>
                        <View style={styles.aiLabelRow}>
                            <Sparkles size={11} color={colors.gold} strokeWidth={2} />
                            <Text style={styles.aiLabel}>VinR</Text>
                        </View>
                        <Text style={styles.aiText} numberOfLines={2}>{entry.ai_response}</Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    dateDot: {
        width: 5, height: 5, borderRadius: 2.5,
        backgroundColor: colors.gold,
    },
    date: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
        color: colors.textSecondary,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    moodBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    moodBadgeText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 10,
        letterSpacing: 0.3,
    },
    gratitudeList: { marginBottom: 6 },
    gratitudeRow: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 4, gap: 8,
    },
    bullet: {
        width: 4, height: 4, borderRadius: 2,
        backgroundColor: colors.gold,
        flexShrink: 0,
        marginTop: 1,
    },
    gratitudeText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textPrimary,
        flex: 1,
    },
    reflectionPreview: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 4,
        fontStyle: 'italic',
        lineHeight: 19,
    },
    aiPreview: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    aiLabelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginBottom: 3,
    },
    aiLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 10,
        color: colors.gold,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    aiText: {
        fontFamily: fonts.italic,
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 19,
    },
});
