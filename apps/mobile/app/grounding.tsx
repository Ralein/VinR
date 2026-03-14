/**
 * Grounding 5-4-3-2-1 Interactive Exercise
 *
 * Step-by-step animated prompts with user input at each step.
 * AI reflection at the end.
 */

import { useState } from 'react';
import {
    View, Text, Pressable, StyleSheet, TextInput,
    KeyboardAvoidingView, Platform, ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../constants/theme';

interface GroundingStep {
    count: number;
    sense: string;
    emoji: string;
    prompt: string;
    placeholder: string;
}

const GROUNDING_STEPS: GroundingStep[] = [
    { count: 5, sense: 'See', emoji: '👀', prompt: 'Name 5 things you can see right now.', placeholder: 'I can see...' },
    { count: 4, sense: 'Touch', emoji: '✋', prompt: 'Name 4 things you can touch.', placeholder: 'I can feel...' },
    { count: 3, sense: 'Hear', emoji: '👂', prompt: 'Name 3 things you can hear.', placeholder: 'I can hear...' },
    { count: 2, sense: 'Smell', emoji: '👃', prompt: 'Name 2 things you can smell.', placeholder: 'I can smell...' },
    { count: 1, sense: 'Taste', emoji: '👅', prompt: 'Name 1 thing you can taste.', placeholder: 'I can taste...' },
];

export default function GroundingScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
    const [isComplete, setIsComplete] = useState(false);
    const [currentInput, setCurrentInput] = useState('');

    const step = GROUNDING_STEPS[currentStep];
    const isLastStep = currentStep === GROUNDING_STEPS.length - 1;

    const handleNext = () => {
        const updated = [...answers];
        updated[currentStep] = currentInput;
        setAnswers(updated);

        if (isLastStep) {
            setIsComplete(true);
        } else {
            setCurrentStep(currentStep + 1);
            setCurrentInput('');
        }
    };

    // Generate a reflection based on answers
    const getReflection = () => {
        const seeAnswer = answers[0] || '';
        const touchAnswer = answers[1] || '';

        if (seeAnswer.toLowerCase().includes('nature') ||
            seeAnswer.toLowerCase().includes('tree') ||
            seeAnswer.toLowerCase().includes('sky') ||
            seeAnswer.toLowerCase().includes('green')) {
            return "You noticed a lot of nature around you — that's a beautiful instinct. Your brain naturally gravitates toward calming elements.";
        }
        if (touchAnswer.toLowerCase().includes('warm') ||
            touchAnswer.toLowerCase().includes('soft')) {
            return "You're drawn to comforting textures — your body knows what it needs to feel safe. Trust that instinct.";
        }
        return "You just grounded yourself in the present moment. The anxiety lives in the future, but you're here — right now — and you're okay.";
    };

    if (isComplete) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.completeContainer}>
                    <Text style={styles.completeEmoji}>🌿</Text>
                    <Text style={styles.completeTitle}>You're grounded.</Text>
                    <View style={styles.reflectionCard}>
                        <Text style={styles.reflectionText}>
                            "{getReflection()}"
                        </Text>
                        <Text style={styles.reflectionAttrib}>— VinR</Text>
                    </View>

                    {/* Summary of answers */}
                    <View style={styles.summarySection}>
                        <Text style={styles.summaryTitle}>What you noticed:</Text>
                        {GROUNDING_STEPS.map((s, i) => (
                            answers[i] ? (
                                <View key={i} style={styles.summaryRow}>
                                    <Text style={styles.summaryEmoji}>{s.emoji}</Text>
                                    <Text style={styles.summaryText}>{answers[i]}</Text>
                                </View>
                            ) : null
                        ))}
                    </View>

                    <Pressable
                        style={styles.doneButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.doneButtonText}>Done ✓</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.stepContainer}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backText}>← Back</Text>
                    </Pressable>

                    {/* Progress */}
                    <View style={styles.progressRow}>
                        {GROUNDING_STEPS.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.progressDot,
                                    i <= currentStep && styles.progressDotActive,
                                    i < currentStep && styles.progressDotDone,
                                ]}
                            />
                        ))}
                    </View>

                    {/* Step Content */}
                    <Text style={styles.stepEmoji}>{step.emoji}</Text>
                    <Text style={styles.stepCount}>{step.count}</Text>
                    <Text style={styles.stepPrompt}>{step.prompt}</Text>

                    <TextInput
                        style={styles.input}
                        placeholder={step.placeholder}
                        placeholderTextColor={colors.textGhost}
                        value={currentInput}
                        onChangeText={setCurrentInput}
                        multiline
                        autoFocus
                    />

                    <Pressable
                        style={[
                            styles.nextButton,
                            !currentInput.trim() && styles.nextButtonDisabled,
                        ]}
                        onPress={handleNext}
                        disabled={!currentInput.trim()}
                    >
                        <Text style={styles.nextButtonText}>
                            {isLastStep ? 'Finish ✓' : 'Next →'}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    backButton: {
        alignSelf: 'flex-start', marginBottom: spacing.lg,
    },
    backText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.gold },
    stepContainer: {
        flex: 1, paddingHorizontal: spacing.xl,
        justifyContent: 'center', alignItems: 'center',
    },
    progressRow: {
        flexDirection: 'row', gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    progressDot: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: colors.surface, borderWidth: 2,
        borderColor: colors.border,
    },
    progressDotActive: { borderColor: colors.gold },
    progressDotDone: { backgroundColor: colors.gold, borderColor: colors.gold },
    stepEmoji: { fontSize: 48, marginBottom: spacing.md },
    stepCount: {
        fontFamily: fonts.mono, fontSize: 72,
        color: colors.gold, marginBottom: spacing.sm,
    },
    stepPrompt: {
        fontFamily: fonts.display, fontSize: 22,
        color: colors.textPrimary, textAlign: 'center',
        marginBottom: spacing.xl,
    },
    input: {
        width: '100%', minHeight: 80,
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        fontFamily: fonts.body, fontSize: 16,
        color: colors.textPrimary, textAlignVertical: 'top',
        borderWidth: 1, borderColor: colors.border,
        marginBottom: spacing.lg,
    },
    nextButton: {
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
        borderRadius: borderRadius.full, backgroundColor: colors.gold,
    },
    nextButtonDisabled: { opacity: 0.4 },
    nextButtonText: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.void,
    },
    // Complete screen
    completeContainer: {
        alignItems: 'center', paddingHorizontal: spacing.xl,
        paddingTop: spacing['2xl'],
    },
    completeEmoji: { fontSize: 56, marginBottom: spacing.md },
    completeTitle: {
        fontFamily: fonts.display, fontSize: 28,
        color: colors.textPrimary, marginBottom: spacing.lg,
    },
    reflectionCard: {
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.lg, width: '100%',
        borderWidth: 1, borderColor: colors.gold + '30',
        marginBottom: spacing.xl,
    },
    reflectionText: {
        fontFamily: fonts.italic, fontSize: 17,
        color: colors.textPrimary, lineHeight: 26,
    },
    reflectionAttrib: {
        fontFamily: fonts.bodySemiBold, fontSize: 13,
        color: colors.gold, marginTop: spacing.sm,
        textAlign: 'right',
    },
    summarySection: {
        width: '100%', marginBottom: spacing.xl,
    },
    summaryTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 16,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row', alignItems: 'flex-start',
        gap: spacing.sm, marginBottom: spacing.sm,
    },
    summaryEmoji: { fontSize: 18, marginTop: 2 },
    summaryText: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted, flex: 1,
    },
    doneButton: {
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
        borderRadius: borderRadius.full, backgroundColor: colors.emerald,
    },
    doneButtonText: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.void,
    },
});
