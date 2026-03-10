/**
 * JournalEntry — Individual journal entry display card
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';

const MOOD_EMOJIS: Record<number, string> = {
    1: '😞', 2: '😐', 3: '🙂', 4: '😊', 5: '🤩',
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
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export default function JournalEntry({ entry, onPress }: JournalEntryProps) {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            {/* Header row */}
            <View style={styles.header}>
                <Text style={styles.date}>{formatDate(entry.date)}</Text>
                {entry.mood_at_entry && (
                    <Text style={styles.moodEmoji}>
                        {MOOD_EMOJIS[entry.mood_at_entry] || ''}
                    </Text>
                )}
            </View>

            {/* Gratitude bullets */}
            <View style={styles.gratitudeList}>
                {entry.gratitude_items.map((item, i) => (
                    <View key={i} style={styles.gratitudeRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.gratitudeText} numberOfLines={2}>
                            {item}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Reflection preview */}
            {entry.reflection_text && (
                <Text style={styles.reflectionPreview} numberOfLines={2}>
                    {entry.reflection_text}
                </Text>
            )}

            {/* AI response preview */}
            {entry.ai_response && (
                <View style={styles.aiPreview}>
                    <Text style={styles.aiLabel}>✨ VinR</Text>
                    <Text style={styles.aiText} numberOfLines={2}>
                        {entry.ai_response}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
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
    date: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        color: colors.textMuted,
    },
    moodEmoji: {
        fontSize: 18,
    },
    gratitudeList: {
        marginBottom: spacing.xs,
    },
    gratitudeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 3,
    },
    bullet: {
        color: colors.gold,
        fontSize: 14,
        marginRight: spacing.xs,
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
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
    aiPreview: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    aiLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.gold,
        marginBottom: 2,
    },
    aiText: {
        fontFamily: fonts.italic,
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 19,
    },
});
