/**
 * GratitudeInput — Journal entry form with 3 gratitude fields, reflection, mood, submit
 */

import { useState } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';

interface GratitudeInputProps {
    onSubmit: (data: {
        gratitude_items: string[];
        reflection_text?: string;
        mood_at_entry?: number;
    }) => void;
    isSubmitting: boolean;
}

const MOOD_LABELS = ['😞', '😐', '🙂', '😊', '🤩'];

export default function GratitudeInput({ onSubmit, isSubmitting }: GratitudeInputProps) {
    const [gratitude1, setGratitude1] = useState('');
    const [gratitude2, setGratitude2] = useState('');
    const [gratitude3, setGratitude3] = useState('');
    const [reflection, setReflection] = useState('');
    const [mood, setMood] = useState<number | null>(null);

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
            {/* Section header */}
            <Text style={styles.sectionLabel}>TODAY'S GRATITUDE</Text>

            {/* Gratitude fields */}
            {[
                { value: gratitude1, setter: setGratitude1, placeholder: 'I\'m grateful for...' },
                { value: gratitude2, setter: setGratitude2, placeholder: 'I\'m also grateful for...' },
                { value: gratitude3, setter: setGratitude3, placeholder: 'And one more...' },
            ].map((field, i) => (
                <View key={i} style={styles.inputRow}>
                    <Text style={styles.inputNumber}>{i + 1}</Text>
                    <TextInput
                        style={styles.input}
                        value={field.value}
                        onChangeText={field.setter}
                        placeholder={field.placeholder}
                        placeholderTextColor={colors.textGhost}
                        maxLength={200}
                        returnKeyType="next"
                    />
                </View>
            ))}

            {/* Reflection text */}
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>REFLECTION</Text>
            <TextInput
                style={styles.reflectionInput}
                value={reflection}
                onChangeText={setReflection}
                placeholder="What else is on my mind..."
                placeholderTextColor={colors.textGhost}
                multiline
                maxLength={2000}
                textAlignVertical="top"
            />

            {/* Mood rating */}
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>HOW ARE YOU FEELING?</Text>
            <View style={styles.moodRow}>
                {MOOD_LABELS.map((emoji, i) => {
                    const rating = i + 1;
                    const isActive = mood === rating;
                    return (
                        <Pressable
                            key={rating}
                            style={[styles.moodChip, isActive && styles.moodChipActive]}
                            onPress={() => setMood(rating)}
                        >
                            <Text style={[styles.moodEmoji, isActive && styles.moodEmojiActive]}>
                                {emoji}
                            </Text>
                        </Pressable>
                    );
                })}
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
                    <Text style={styles.submitText}>Save & Reflect ✨</Text>
                )}
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.textGhost,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    inputNumber: {
        fontFamily: fonts.mono,
        fontSize: 14,
        color: colors.gold,
        width: 24,
    },
    input: {
        flex: 1,
        fontFamily: fonts.body,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reflectionInput: {
        fontFamily: fonts.body,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 80,
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    moodChip: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.elevated,
        borderWidth: 1,
        borderColor: colors.border,
    },
    moodChipActive: {
        backgroundColor: colors.gold + '25',
        borderColor: colors.gold,
    },
    moodEmoji: {
        fontSize: 24,
        opacity: 0.5,
    },
    moodEmojiActive: {
        opacity: 1,
    },
    submitButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
    },
    submitButtonDisabled: {
        opacity: 0.4,
    },
    submitText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.void,
    },
});
