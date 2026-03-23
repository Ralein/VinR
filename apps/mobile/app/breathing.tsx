import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    interpolate,
    FadeIn,
    FadeOut,
    runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { X, Play, Pause, Wind } from 'lucide-react-native';
import GlassCard from '../components/ui/GlassCard';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../constants/theme';
import { haptics } from '../services/haptics';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Phase = 'inhale' | 'holdInhale' | 'exhale' | 'holdExhale' | 'idle';

export default function BreathingScreen() {
    const { name } = useLocalSearchParams();
    const breathingType = name?.toString().toLowerCase() || 'relax';
    
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    const [timeRemaining, setTimeRemaining] = useState(60 * 3); // 3 minutes total

    // Animation values
    const progress = useSharedValue(0); // 0 to 1
    const pulse = useSharedValue(1);

    // Determine the configuration dynamically
    const config = React.useMemo(() => {
        if (breathingType.includes('box')) {
            return { inhale: 4000, holdInhale: 4000, exhale: 4000, holdExhale: 4000 };
        } else if (breathingType.includes('4-7-8') || breathingType.includes('478')) {
            return { inhale: 4000, holdInhale: 7000, exhale: 8000, holdExhale: 0 };
        }
        return { inhale: 4000, holdInhale: 2000, exhale: 6000, holdExhale: 0 };
    }, [breathingType]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((t) => t - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            stopExercise();
        }
        return () => clearInterval(interval);
    }, [isActive, timeRemaining]);

    const runCycle = () => {
        if (!isActive) return;

        // Inhale
        setPhase('inhale');
        haptics.medium();
        progress.value = withTiming(1, { duration: config.inhale, easing: Easing.inOut(Easing.quad) }, (finished) => {
            if (finished && isActive) {
                
                const startExhale = () => {
                    if (!isActive) return;
                    setPhase('exhale');
                    haptics.medium();
                    progress.value = withTiming(0, { duration: config.exhale, easing: Easing.inOut(Easing.quad) }, (exFinished) => {
                        if (exFinished && isActive) {
                            
                            const startNextCycle = () => {
                                if (isActive) runCycle();
                            };

                            if (config.holdExhale > 0) {
                                setPhase('holdExhale');
                                progress.value = withTiming(0, { duration: config.holdExhale }, (hkFinished) => {
                                    if (hkFinished && isActive) {
                                        runOnJS(startNextCycle)();
                                    }
                                });
                            } else {
                                runOnJS(startNextCycle)();
                            }
                        }
                    });
                };

                if (config.holdInhale > 0) {
                    setPhase('holdInhale');
                    progress.value = withTiming(1, { duration: config.holdInhale }, (holdFinished) => {
                        if (holdFinished && isActive) {
                            runOnJS(startExhale)();
                        }
                    });
                } else {
                    runOnJS(startExhale)();
                }
            }
        });
    };

    useEffect(() => {
        if (isActive) {
            runCycle();
            // Subtle pulse ring animation
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            ) as any;
        } else {
            setPhase('idle');
            progress.value = withTiming(0, { duration: 1000 });
            pulse.value = withTiming(1, { duration: 1000 });
        }
    }, [isActive]);

    const toggleExercise = () => {
        haptics.light();
        setIsActive(!isActive);
    };

    const stopExercise = () => {
        haptics.light();
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const circleStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [1, 2.5]);
        const opacity = interpolate(progress.value, [0, 1], [0.3, 0.8]);
        return {
            transform: [{ scale }],
            opacity,
        };
    });

    const outerRingStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [1.2, 3]);
        const opacity = interpolate(progress.value, [0, 1], [0.1, 0.4]);
        return {
            transform: [{ scale: scale * pulse.value }],
            opacity,
        };
    });

    const textStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0.1, 0.5, 0.9], [0, 1, 0]),
            transform: [{ translateY: interpolate(progress.value, [0, 1], [10, -10]) }],
        };
    });

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return 'Breathe In...';
            case 'holdInhale': return 'Hold...';
            case 'exhale': return 'Breathe Out...';
            case 'holdExhale': return 'Wait...';
            default: return 'Ready?';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[colors.void, 'rgba(167, 139, 250, 0.1)']}
                style={StyleSheet.absoluteFillObject}
            />
            
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.closeButton}>
                    <X size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={{alignItems: 'center'}}>
                    <Text style={styles.titleText}>{name || 'Breathing'}</Text>
                    <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                {/* Visualizer */}
                <View style={styles.visualizerContainer}>
                    <Animated.View style={[styles.outerRing, outerRingStyle]} />
                    <Animated.View style={[styles.circle, circleStyle]}>
                        <LinearGradient
                            colors={[colors.sapphire, '#818CF8']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </Animated.View>

                    <View style={styles.textOverlay}>
                        {!isActive ? (
                            <Animated.View entering={FadeIn} exiting={FadeOut}>
                                <Text style={styles.idleText}>Tap to begin</Text>
                            </Animated.View>
                        ) : (
                            <Text style={styles.phaseText}>{getPhaseText()}</Text>
                        )}
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <Pressable
                        style={styles.playButton}
                        onPress={toggleExercise}
                    >
                        {isActive ? (
                            <Pause size={32} color={colors.void} fill={colors.void} />
                        ) : (
                            <Play size={32} color={colors.void} fill={colors.void} style={{ marginLeft: 4 }} />
                        )}
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const CIRCLE_SIZE = 120;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timer: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 20,
        color: colors.textPrimary,
        fontVariant: ['tabular-nums'],
    },
    titleText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    placeholder: {
        width: 44,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualizerContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerRing: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: colors.sapphire,
    },
    circle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        overflow: 'hidden',
    },
    textOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    idleText: {
        ...typography.h3,
        color: colors.textPrimary,
        opacity: 0.8,
    },
    phaseText: {
        ...typography.h1,
        color: colors.textPrimary,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    controls: {
        marginTop: 60,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.textPrimary,
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },
});
