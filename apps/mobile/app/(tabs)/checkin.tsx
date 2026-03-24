import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Layout from '../../components/layout/Layout';
import { colors, spacing, fonts, borderRadius } from '../../theme';

const MOODS = [
    { emoji: '☀️', label: 'Radiant', color: '#FFD700' },
    { emoji: '🌿', label: 'Balanced', color: '#4ADE80' },
    { emoji: '🌙', label: 'Calm', color: '#818CF8' },
    { emoji: '🌧️', label: 'Tired', color: '#94A3B8' },
    { emoji: '⚡', label: 'Focused', color: '#F87171' },
];

const FOCUS_AREAS = [
    'Deep Sleep', 'Productivity', 'Stress Relief', 'Gratitude', 'Mindfulness'
];

export default function CheckinScreen() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

    const toggleFocus = (focus: string) => {
        if (selectedFocus.includes(focus)) {
            setSelectedFocus(selectedFocus.filter(f => f !== focus));
        } else {
            setSelectedFocus([...selectedFocus, focus]);
        }
    };

    return (
        <Layout title="Your Check-in">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.question}>How are you feeling today?</Text>
                    <View style={styles.moodGrid}>
                        {MOODS.map(mood => (
                            <Pressable 
                                key={mood.label}
                                style={[
                                    styles.moodItem,
                                    selectedMood === mood.label && { backgroundColor: colors.goldGlow, borderColor: colors.gold }
                                ]}
                                onPress={() => setSelectedMood(mood.label)}
                            >
                                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                <Text style={[
                                    styles.moodLabel,
                                    selectedMood === mood.label && { color: colors.gold }
                                ]}>{mood.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.question}>What's your focus for today?</Text>
                    <View style={styles.chipContainer}>
                        {FOCUS_AREAS.map(area => (
                            <Pressable
                                key={area}
                                style={[
                                    styles.chip,
                                    selectedFocus.includes(area) && { backgroundColor: colors.gold, borderColor: colors.gold }
                                ]}
                                onPress={() => toggleFocus(area)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    selectedFocus.includes(area) && { color: colors.void }
                                ]}>{area}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <Pressable 
                    style={[
                        styles.submitButton,
                        (!selectedMood || selectedFocus.length === 0) && { opacity: 0.5 }
                    ]}
                    disabled={!selectedMood || selectedFocus.length === 0}
                >
                    <Text style={styles.submitText}>Complete Check-in</Text>
                </Pressable>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl * 2,
    },
    card: {
        backgroundColor: colors.elevated,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    question: {
        fontFamily: fonts.heading,
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    moodItem: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodEmoji: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    moodLabel: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textPrimary,
    },
    submitButton: {
        backgroundColor: colors.gold,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.md,
        ...colors.shadowGold,
    },
    submitText: {
        fontFamily: fonts.heading,
        fontSize: 16,
        color: colors.void,
    },
});
