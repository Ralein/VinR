/**
 * Check-in Screen — Daily mood check-in
 *
 * Mood grid (8 chips), text area with rotating placeholders,
 * char counter, privacy badge, "Analyze my feelings →" CTA.
 */

import { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { config } from '../../constants/config';
import { haptics } from '../../services/haptics';
import { useCheckinStore } from '../../stores/checkinStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MoodChip({ emoji, label, value, isSelected, onPress, index }: {
    emoji: string; label: string; value: string;
    isSelected: boolean; onPress: () => void; index: number;
}) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1.05 : 1, animation.spring) }],
        borderColor: isSelected ? colors.gold : colors.border,
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: isSelected ? 'rgba(212,168,83,0.12)' : colors.surface,
    }));

    return (
        <AnimatedPressable onPress={onPress} style={[styles.moodChip, animatedStyle]}>
            <Animated.View entering={FadeInDown.delay(100 + index * 60).duration(400)}>
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelActive]}>
                    {label}
                </Text>
            </Animated.View>
        </AnimatedPressable>
    );
}

export default function CheckinScreen() {
    const { selectedMood, setMood, inputText, setText } = useCheckinStore();
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const canSubmit = selectedMood !== null;

    // Rotate placeholders every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIndex((prev) =>
                (prev + 1) % config.CHECKIN_PLACEHOLDERS.length
            );
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const handleMoodSelect = (value: string) => {
        haptics.selection();
        setMood(value);
    };

    const handleSubmit = () => {
        if (!canSubmit) return;
        haptics.medium();
        router.push('/(tabs)/loading');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <Text style={styles.title}>How are you feeling?</Text>
                        <Text style={styles.subtitle}>
                            Select your mood and tell us what's on your mind
                        </Text>
                    </Animated.View>

                    {/* Mood Grid */}
                    <View style={styles.moodGrid}>
                        {config.MOOD_TAGS.map((mood, index) => (
                            <MoodChip
                                key={mood.value}
                                {...mood}
                                index={index}
                                isSelected={selectedMood === mood.value}
                                onPress={() => handleMoodSelect(mood.value)}
                            />
                        ))}
                    </View>

                    {/* Text Area */}
                    <Animated.View
                        entering={FadeInDown.delay(600).duration(500)}
                        style={styles.textAreaWrapper}
                    >
                        <TextInput
                            style={styles.textArea}
                            placeholder={config.CHECKIN_PLACEHOLDERS[placeholderIndex]}
                            placeholderTextColor={colors.textGhost}
                            value={inputText}
                            onChangeText={setText}
                            multiline
                            maxLength={config.CHECKIN_TEXT_MAX_LENGTH}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCounter}>
                            {inputText.length}/{config.CHECKIN_TEXT_MAX_LENGTH}
                        </Text>
                    </Animated.View>

                    {/* Submit Button */}
                    <Animated.View entering={FadeInDown.delay(800).duration(400)}>
                        <Pressable
                            style={[styles.submitButton, !canSubmit && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={!canSubmit}
                        >
                            <Text style={styles.submitText}>Analyze my feelings →</Text>
                        </Pressable>
                    </Animated.View>

                    {/* Privacy Badge */}
                    <Animated.Text
                        entering={FadeInDown.delay(1000).duration(400)}
                        style={styles.privacyBadge}
                    >
                        🔒 Private & secure — your data is encrypted
                    </Animated.Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    flex: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 32,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 30,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
        marginBottom: 28,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 28,
    },
    moodChip: {
        width: '22.5%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 4,
    },
    moodEmoji: {
        fontSize: 26,
        textAlign: 'center',
    },
    moodLabel: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'center',
    },
    moodLabelActive: {
        color: colors.gold,
        fontFamily: 'DMSans_600SemiBold',
    },
    textAreaWrapper: {
        marginBottom: 24,
    },
    textArea: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 120,
        lineHeight: 24,
    },
    charCounter: {
        fontFamily: 'DMSans_300Light',
        fontSize: 12,
        color: colors.textGhost,
        textAlign: 'right',
        marginTop: 6,
    },
    submitButton: {
        backgroundColor: colors.gold,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    submitText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        color: colors.void,
        letterSpacing: 0.3,
    },
    privacyBadge: {
        fontFamily: 'DMSans_300Light',
        fontSize: 12,
        color: colors.textGhost,
        textAlign: 'center',
    },
});
