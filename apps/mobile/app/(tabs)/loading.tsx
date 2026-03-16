/**
 * Loading Screen — AI analysis in progress
 *
 * Pulsing VinR logo, rotating affirmations,
 * "VinR is listening..." subtitle.
 * Triggers API call and navigates to results/emergency.
 */

import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import VinRLogo from '../../components/ui/VinRLogo';
import { router } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    FadeIn,
} from 'react-native-reanimated';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { haptics } from '../../services/haptics';
import { useCheckinStore } from '../../stores/checkinStore';
import { useCheckin } from '../../hooks/useCheckin';

const AFFIRMATIONS = [
    "You are not your worst moments.",
    "Every emotion is valid.",
    "Asking for help is strength.",
    "This feeling will pass.",
    "You deserve to feel better.",
    "Small steps lead to big changes.",
    "You are worth fighting for.",
];

export default function LoadingScreen() {
    const { selectedMood, inputText, setAnalyzing } = useCheckinStore();
    const checkin = useCheckin();
    const [affirmationIndex, setAffirmationIndex] = useState(0);
    const affirmationOpacity = useSharedValue(1);

    // Pulsing logo
    const logoScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.2);

    useEffect(() => {
        // Logo pulse animation
        logoScale.value = withRepeat(
            withSequence(
                withTiming(1.06, { duration: 1200 }),
                withTiming(0.96, { duration: 1200 })
            ),
            -1,
            true
        );

        // Glow pulse
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.5, { duration: 1500 }),
                withTiming(0.15, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    // Rotate affirmations every 3s
    useEffect(() => {
        const timer = setInterval(() => {
            affirmationOpacity.value = withSequence(
                withTiming(0, { duration: 300 }),
                withTiming(1, { duration: 300 })
            );
            setTimeout(() => {
                setAffirmationIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
            }, 300);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    // Trigger API call
    useEffect(() => {
        if (!selectedMood) {
            router.back();
            return;
        }

        setAnalyzing(true);

        checkin.mutate(
            { mood_tag: selectedMood, text: inputText || null },
            {
                onSuccess: (data) => {
                    setAnalyzing(false);
                    haptics.success();
                    if (data.plan.isEmergency) {
                        router.replace('/(tabs)/emergency');
                    } else {
                        router.replace('/(tabs)/results');
                    }
                },
                onError: () => {
                    setAnalyzing(false);
                    haptics.error();
                    // Navigate to results with fallback data
                    router.replace('/(tabs)/results');
                },
            }
        );
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const affirmationAnimatedStyle = useAnimatedStyle(() => ({
        opacity: affirmationOpacity.value,
    }));

    return (
        <View style={styles.container}>
            {/* Glow */}
            <Animated.View style={[styles.glow, glowAnimatedStyle]} />

            {/* Logo */}
            <Animated.View style={[styles.logoWrap, logoAnimatedStyle]}>
                <VinRLogo size="lg" />
            </Animated.View>

            {/* Subtitle */}
            <Animated.Text entering={FadeIn.delay(300).duration(500)} style={styles.subtitle}>
                VinR is listening...
            </Animated.Text>

            {/* Rotating Affirmation */}
            <Animated.Text style={[styles.affirmation, affirmationAnimatedStyle]}>
                "{AFFIRMATIONS[affirmationIndex]}"
            </Animated.Text>

            {/* Dots */}
            <Animated.Text entering={FadeIn.delay(600).duration(400)} style={styles.dots}>
                Analyzing your emotions with AI
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    glow: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: colors.goldGlow,
    },
    logoWrap: {
        alignItems: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 18,
        color: colors.textMuted,
        marginBottom: 32,
    },
    affirmation: {
        fontFamily: 'DMSans_300Light',
        fontSize: 16,
        color: colors.gold,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 40,
        lineHeight: 24,
    },
    dots: {
        fontFamily: 'DMSans_300Light',
        fontSize: 12,
        color: colors.textGhost,
        letterSpacing: 1,
    },
});
