/**
 * Onboarding Step 2 — "How have you been feeling lately?"
 *
 * 8 mood chips in a 2×4 grid with emoji + label.
 * Multi-select with gold border + haptic on toggle.
 * Stagger reveal animation (80ms per chip).
 */

import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { colors, animation } from '../../../constants/theme';
import { haptics } from '../../../services/haptics';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { ProgressDots } from '../../../components/ui/ProgressDots';

const MOODS = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'anxious', emoji: '😰', label: 'Anxious' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { id: 'exhausted', emoji: '😴', label: 'Exhausted' },
    { id: 'confused', emoji: '🤔', label: 'Confused' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'motivated', emoji: '💪', label: 'Motivated' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MoodChip({ id, emoji, label, isSelected, onPress, index }: {
    id: string; emoji: string; label: string; isSelected: boolean; onPress: () => void; index: number;
}) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1.05 : 1, animation.spring) }],
        borderColor: isSelected ? colors.gold : colors.border,
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: isSelected ? 'rgba(212,168,83,0.12)' : colors.surface,
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.moodChip, animatedStyle]}
        >
            <Animated.View entering={FadeInDown.delay(200 + index * 80).duration(400)}>
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelActive]}>
                    {label}
                </Text>
            </Animated.View>
        </AnimatedPressable>
    );
}

export default function Step2Mood() {
    const { selectedMoods, toggleMood } = useOnboardingStore();
    const canContinue = selectedMoods.length >= 1;

    const handleToggle = (id: string) => {
        haptics.selection();
        toggleMood(id);
    };

    const handleContinue = () => {
        if (!canContinue) return;
        haptics.medium();
        router.push('/(auth)/onboarding/step3-music');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0E1A', colors.void, '#070B14']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <ProgressDots currentStep={2} />

                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.step}>Step 2 of 4</Text>
                    <Text style={styles.title}>How have you been feeling lately?</Text>
                    <Text style={styles.subtitle}>
                        No pressure — this helps us personalize for you
                    </Text>
                </Animated.View>

                {/* Mood Grid */}
                <View style={styles.moodGrid}>
                    {MOODS.map((mood, index) => (
                        <MoodChip
                            key={mood.id}
                            {...mood}
                            index={index}
                            isSelected={selectedMoods.includes(mood.id)}
                            onPress={() => handleToggle(mood.id)}
                        />
                    ))}
                </View>

                {/* Selection count */}
                <Animated.Text
                    entering={FadeInDown.delay(900).duration(400)}
                    style={styles.selectionHint}
                >
                    {selectedMoods.length === 0
                        ? 'Tap all that apply'
                        : `${selectedMoods.length} selected`}
                </Animated.Text>

                {/* Continue Button */}
                <Animated.View entering={FadeInDown.delay(1000).duration(400)}>
                    <Pressable
                        style={[styles.continueButton, !canContinue && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!canContinue}
                    >
                        <Text style={styles.continueText}>Continue →</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingTop: 72,
        paddingBottom: 48,
    },
    step: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: colors.gold,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 12,
        textAlign: 'center',
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 36,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    moodChip: {
        width: '44%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 14,
    },
    moodEmoji: {
        fontSize: 28,
    },
    moodLabel: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textMuted,
    },
    moodLabelActive: {
        color: colors.gold,
        fontFamily: 'DMSans_600SemiBold',
    },
    selectionHint: {
        fontFamily: 'DMSans_300Light',
        fontSize: 13,
        color: colors.textGhost,
        textAlign: 'center',
        marginBottom: 32,
    },
    continueButton: {
        backgroundColor: colors.gold,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    continueText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        color: colors.void,
        letterSpacing: 0.3,
    },
});
