/**
 * GratitudeInput v2 — Emoji-free mood selection with Lucide icons + animated input cards
 */

import { useState } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, {
    FadeInDown, useAnimatedStyle, withSpring, useSharedValue,
    withTiming, interpolateColor,
} from 'react-native-reanimated';
import {
    Frown, Meh, Smile, SmilePlus, Star, Sparkles, Send,
} from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';

interface GratitudeInputProps {
    onSubmit: (data: {
        gratitude_items: string[];
        reflection_text?: string;
        mood_at_entry?: number;
    }) => void;
    isSubmitting: boolean;
}

const MOODS: Array<{ rating: number; Icon: typeof Smile; label: string; color: string }> = [
    { rating: 1, Icon: Frown,     label: 'Low',     color: '#E85D5D' },
    { rating: 2, Icon: Meh,       label: 'Okay',    color: '#D4A853' },
    { rating: 3, Icon: Smile,     label: 'Good',    color: '#4ECBA0' },
    { rating: 4, Icon: SmilePlus, label: 'Great',   color: '#4A90D9' },
    { rating: 5, Icon: Star,      label: 'Amazing', color: '#8B7EC8' },
];

function MoodButton({ rating, Icon, label, color, selected, onPress }: {
    rating: number; Icon: typeof Smile; label: string; color: string;
    selected: boolean; onPress: () => void;
}) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(selected ? 1.12 : 1, { stiffness: 240, damping: 18 }) }],
    }));

    return (
        <Pressable
            onPress={() => { scale.value = 0.88; onPress(); }}
            onPressIn={() => { scale.value = 0.88; }}
            onPressOut={() => { scale.value = 1; }}
            style={styles.moodBtn}
        >
            <Animated.View style={[
                styles.moodOrb,
                { borderColor: selected ? color : colors.border, backgroundColor: selected ? `${color}18` : colors.elevated },
                animStyle,
            ]}>
                <Icon size={22} color={selected ? color : colors.textGhost} strokeWidth={selected ? 2.2 : 1.6} />
            </Animated.View>
            <Text style={[styles.moodLabel, selected && { color, opacity: 1 }]}>{label}</Text>
        </Pressable>
    );
}

function InputCard({ index, value, setter, placeholder }: {
    index: number; value: string; setter: (s: string) => void; placeholder: string;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <Animated.View entering={FadeInDown.delay(index * 60).duration(320)} style={[
            styles.inputCard,
            focused && { borderColor: `${colors.gold}60`, backgroundColor: `${colors.gold}06` },
        ]}>
            <View style={styles.inputNumBadge}>
                <Text style={styles.inputNum}>{index + 1}</Text>
            </View>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={colors.textGhost}
                maxLength={200}
                returnKeyType="next"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </Animated.View>
    );
}

export default function GratitudeInput({ onSubmit, isSubmitting }: GratitudeInputProps) {
    const [gratitude1, setGratitude1] = useState('');
    const [gratitude2, setGratitude2] = useState('');
    const [gratitude3, setGratitude3] = useState('');
    const [reflection, setReflection] = useState('');
    const [mood, setMood] = useState<number | null>(null);
    const [reflFocused, setReflFocused] = useState(false);

    const canSubmit = gratitude1.trim().length > 0 && !isSubmitting;

    const handleSubmit = () => {
        const items = [gratitude1, gratitude2, gratitude3]
            .map(s => s.trim())
            .filter(Boolean);
        onSubmit({
            gratitude_items: items,
            reflection_text: reflection.trim() || undefined,
            mood_at_entry: mood ?? undefined,
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            {/* Gratitude */}
            <View style={styles.sectionHeadRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionLabel}>TODAY'S GRATITUDE</Text>
            </View>

            <InputCard index={0} value={gratitude1} setter={setGratitude1} placeholder="I'm grateful for..." />
            <InputCard index={1} value={gratitude2} setter={setGratitude2} placeholder="I'm also grateful for..." />
            <InputCard index={2} value={gratitude3} setter={setGratitude3} placeholder="And one more thing..." />

            {/* Reflection */}
            <View style={[styles.sectionHeadRow, { marginTop: spacing.lg }]}>
                <View style={[styles.sectionDot, { backgroundColor: colors.sapphire }]} />
                <Text style={styles.sectionLabel}>REFLECTION</Text>
            </View>
            <TextInput
                style={[styles.reflectionInput, reflFocused && { borderColor: `${colors.sapphire}50` }]}
                value={reflection}
                onChangeText={setReflection}
                placeholder="What else is on my mind..."
                placeholderTextColor={colors.textGhost}
                multiline
                maxLength={2000}
                textAlignVertical="top"
                onFocus={() => setReflFocused(true)}
                onBlur={() => setReflFocused(false)}
            />

            {/* Mood */}
            <View style={[styles.sectionHeadRow, { marginTop: spacing.lg }]}>
                <View style={[styles.sectionDot, { backgroundColor: colors.lavender }]} />
                <Text style={styles.sectionLabel}>HOW ARE YOU FEELING?</Text>
            </View>
            <View style={styles.moodRow}>
                {MOODS.map((m) => (
                    <MoodButton
                        key={m.rating}
                        {...m}
                        selected={mood === m.rating}
                        onPress={() => setMood(m.rating)}
                    />
                ))}
            </View>

            {/* Submit */}
            <Pressable
                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
            >
                {isSubmitting ? (
                    <ActivityIndicator color={colors.void} />
                ) : (
                    <View style={styles.submitInner}>
                        <Sparkles size={16} color={colors.void} strokeWidth={2} />
                        <Text style={styles.submitText}>Save & Reflect</Text>
                        <Send size={14} color={colors.void} strokeWidth={2} />
                    </View>
                )}
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionHeadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    sectionDot: {
        width: 4, height: 4, borderRadius: 2,
        backgroundColor: colors.gold,
    },
    sectionLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 10,
        color: colors.textGhost,
        textTransform: 'uppercase',
        letterSpacing: 1.6,
    },
    // Gratitude
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
        overflow: 'hidden',
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    inputNumBadge: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: `${colors.gold}20`,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    inputNum: {
        fontFamily: fonts.mono,
        fontSize: 12,
        color: colors.gold,
    },
    input: {
        flex: 1,
        fontFamily: fonts.body,
        fontSize: 15,
        color: colors.textPrimary,
    },
    reflectionInput: {
        fontFamily: fonts.body,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 90,
    },
    // Mood
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingHorizontal: 4,
    },
    moodBtn: { alignItems: 'center', gap: 5 },
    moodOrb: {
        width: 50, height: 50, borderRadius: 25,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5,
    },
    moodLabel: {
        fontFamily: fonts.body,
        fontSize: 9.5,
        color: colors.textGhost,
        opacity: 0.7,
        letterSpacing: 0.3,
    },
    // Submit
    submitButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
    },
    submitButtonDisabled: { opacity: 0.4 },
    submitInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    submitText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.void,
    },
});
