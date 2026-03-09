/**
 * ProgressDots — Animated step progress indicator
 *
 * Active step = gold pill, completed = gold circle, future = dim circle
 * Used across all 4 onboarding steps.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { colors, animation } from '../../constants/theme';

interface ProgressDotsProps {
    currentStep: number;
    totalSteps?: number;
}

export function ProgressDots({ currentStep, totalSteps = 4 }: ProgressDotsProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }, (_, i) => (
                <Dot key={i} index={i} isActive={i + 1 === currentStep} isCompleted={i + 1 < currentStep} />
            ))}
        </View>
    );
}

function Dot({ index, isActive, isCompleted }: { index: number; isActive: boolean; isCompleted: boolean }) {
    const animatedStyle = useAnimatedStyle(() => ({
        width: withSpring(isActive ? 28 : 8, animation.spring),
        backgroundColor: isActive || isCompleted ? colors.gold : colors.textGhost,
        opacity: withSpring(isActive ? 1 : isCompleted ? 0.7 : 0.3, animation.spring),
    }));

    return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});
