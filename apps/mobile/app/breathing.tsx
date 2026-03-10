/**
 * Interactive Breathing Guide — Animated circle with technique selection
 *
 * Techniques: Box, 4-7-8, Coherent, Physiological Sigh
 * Gold glow circle synced to breathing pattern
 */

import { useState, useEffect, useRef } from 'react';
import {
    View, Text, Pressable, StyleSheet, Animated,
    Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius } from '../constants/theme';
import {
    BREATHING_TECHNIQUES,
    DURATIONS,
    useLogSession,
    BreathingTechnique,
} from '../hooks/useBreathing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.55;

type Phase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out' | 'idle' | 'complete';

const PHASE_LABELS: Record<Phase, string> = {
    inhale: 'Breathe in',
    hold_in: 'Hold',
    exhale: 'Breathe out',
    hold_out: 'Hold',
    idle: 'Ready?',
    complete: 'Well done 🎉',
};

export default function BreathingScreen() {
    const router = useRouter();
    const [technique, setTechnique] = useState<BreathingTechnique>(BREATHING_TECHNIQUES[0]);
    const [durationIdx, setDurationIdx] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    const [elapsed, setElapsed] = useState(0);

    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0.4)).current;
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const logSession = useLogSession();

    const totalDuration = DURATIONS[durationIdx].seconds;
    const pattern = technique.pattern; // [inhale, hold, exhale, hold]

    useEffect(() => {
        if (!isActive) return;

        const cycleTime = pattern.reduce((a, b) => a + b, 0) * 1000;
        let currentElapsed = 0;

        const interv = setInterval(() => {
            currentElapsed += 1;
            setElapsed(currentElapsed);

            if (currentElapsed >= totalDuration) {
                setIsActive(false);
                setPhase('complete');
                clearInterval(interv);
                // Log the session
                logSession.mutate({
                    session_type: 'breathing',
                    duration_seconds: totalDuration,
                    technique: technique.id,
                });
                return;
            }

            // Determine current phase within the cycle
            const posInCycle = (currentElapsed * 1000) % cycleTime;
            let accumulated = 0;
            const phases: Phase[] = ['inhale', 'hold_in', 'exhale', 'hold_out'];

            for (let i = 0; i < 4; i++) {
                accumulated += pattern[i] * 1000;
                if (posInCycle < accumulated) {
                    setPhase(phases[i]);
                    break;
                }
            }
        }, 1000);

        timerRef.current = interv;
        return () => clearInterval(interv);
    }, [isActive, technique, totalDuration]);

    // Animate circle based on phase
    useEffect(() => {
        if (phase === 'inhale') {
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: pattern[0] * 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
            Animated.timing(opacityAnim, {
                toValue: 0.8,
                duration: pattern[0] * 1000,
                useNativeDriver: true,
            }).start();
        } else if (phase === 'exhale') {
            Animated.timing(scaleAnim, {
                toValue: 0.5,
                duration: pattern[2] * 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
            Animated.timing(opacityAnim, {
                toValue: 0.4,
                duration: pattern[2] * 1000,
                useNativeDriver: true,
            }).start();
        }
    }, [phase]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleStartStop = () => {
        if (phase === 'complete') {
            setPhase('idle');
            setElapsed(0);
            return;
        }
        if (isActive) {
            setIsActive(false);
            setPhase('idle');
            setElapsed(0);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            setIsActive(true);
            setPhase('inhale');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>
                <Text style={styles.title}>Breathing Guide</Text>
                <View style={{ width: 50 }} />
            </View>

            {/* Technique Selector */}
            {!isActive && phase !== 'complete' && (
                <View style={styles.techniqueRow}>
                    {BREATHING_TECHNIQUES.map((t) => (
                        <Pressable
                            key={t.id}
                            style={[
                                styles.techniqueChip,
                                technique.id === t.id && styles.techniqueChipActive,
                            ]}
                            onPress={() => setTechnique(t)}
                        >
                            <Text style={styles.techniqueEmoji}>{t.emoji}</Text>
                            <Text
                                style={[
                                    styles.techniqueName,
                                    technique.id === t.id && styles.techniqueNameActive,
                                ]}
                            >
                                {t.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* Description */}
            {!isActive && phase !== 'complete' && (
                <Text style={styles.description}>{technique.description}</Text>
            )}

            {/* Breathing Circle */}
            <View style={styles.circleWrapper}>
                <Animated.View
                    style={[
                        styles.circle,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                />
                <View style={styles.circleContent}>
                    <Text style={styles.phaseLabel}>{PHASE_LABELS[phase]}</Text>
                    {isActive && (
                        <Text style={styles.timer}>
                            {formatTime(totalDuration - elapsed)}
                        </Text>
                    )}
                </View>
            </View>

            {/* Duration Selector */}
            {!isActive && phase !== 'complete' && (
                <View style={styles.durationRow}>
                    {DURATIONS.map((d, i) => (
                        <Pressable
                            key={d.label}
                            style={[
                                styles.durationChip,
                                durationIdx === i && styles.durationChipActive,
                            ]}
                            onPress={() => setDurationIdx(i)}
                        >
                            <Text
                                style={[
                                    styles.durationText,
                                    durationIdx === i && styles.durationTextActive,
                                ]}
                            >
                                {d.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* Start / Stop */}
            <Pressable
                style={[
                    styles.actionButton,
                    isActive && styles.actionButtonStop,
                    phase === 'complete' && styles.actionButtonComplete,
                ]}
                onPress={handleStartStop}
            >
                <Text style={styles.actionText}>
                    {phase === 'complete' ? 'Done ✓' : isActive ? 'Stop' : 'Begin'}
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.void,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', width: '100%',
        paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    },
    backText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.gold },
    title: {
        fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary,
    },
    techniqueRow: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'center', gap: spacing.sm,
        paddingHorizontal: spacing.lg, marginTop: spacing.lg,
    },
    techniqueChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: borderRadius.full, backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
    },
    techniqueChipActive: {
        backgroundColor: colors.goldGlow, borderColor: colors.gold,
    },
    techniqueEmoji: { fontSize: 16 },
    techniqueName: {
        fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.textMuted,
    },
    techniqueNameActive: { color: colors.gold },
    description: {
        fontFamily: fonts.body, fontSize: 14, color: colors.textMuted,
        textAlign: 'center', paddingHorizontal: 40,
        marginTop: spacing.md,
    },
    circleWrapper: {
        width: CIRCLE_SIZE + 40, height: CIRCLE_SIZE + 40,
        alignItems: 'center', justifyContent: 'center',
        marginVertical: spacing.xl,
    },
    circle: {
        width: CIRCLE_SIZE, height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: colors.gold,
        position: 'absolute',
    },
    circleContent: {
        alignItems: 'center', justifyContent: 'center',
    },
    phaseLabel: {
        fontFamily: fonts.display, fontSize: 24,
        color: colors.void, textAlign: 'center',
    },
    timer: {
        fontFamily: fonts.mono, fontSize: 18,
        color: colors.void, marginTop: 4,
    },
    durationRow: {
        flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg,
    },
    durationChip: {
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
        borderRadius: borderRadius.full, backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
    },
    durationChipActive: {
        backgroundColor: colors.goldGlow, borderColor: colors.gold,
    },
    durationText: {
        fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.textMuted,
    },
    durationTextActive: { color: colors.gold },
    actionButton: {
        paddingHorizontal: 48, paddingVertical: spacing.md,
        borderRadius: borderRadius.full, backgroundColor: colors.gold,
    },
    actionButtonStop: { backgroundColor: colors.crimson },
    actionButtonComplete: { backgroundColor: colors.emerald },
    actionText: {
        fontFamily: fonts.bodySemiBold, fontSize: 18, color: colors.void,
    },
});
