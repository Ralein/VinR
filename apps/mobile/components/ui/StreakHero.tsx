/**
 * StreakHero — Premium streak display with count-up animation
 *
 * Large animated streak counter with flame icon from Lucide,
 * progress rings for weekly completion, and a motivational subtitle.
 * Sits center-stage on the Home screen as the hero card content.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { Flame, CheckCircle2, Circle } from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import ProgressRing from './ProgressRing';

interface StreakHeroProps {
    streak: number;
    todayDone?: boolean;
    weeklyDays?: boolean[]; // 7 items — which days completed this week
}

export default function StreakHero({
    streak,
    todayDone = false,
    weeklyDays = [false, false, false, false, false, false, false],
}: StreakHeroProps) {
    // Flame scale pulse
    const flamePulse = useSharedValue(1);

    useEffect(() => {
        if (streak > 0) {
            flamePulse.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 800, easing: Easing.out(Easing.quad) }),
                    withTiming(1.0, { duration: 600, easing: Easing.in(Easing.quad) })
                ),
                -1,
                false
            );
        }
    }, [streak]);

    const flameStyle = useAnimatedStyle(() => ({
        transform: [{ scale: flamePulse.value }],
    }));

    const weeklyProgress = weeklyDays.filter(Boolean).length / 7;
    const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <View style={styles.container}>
            {/* Streak Number + Flame */}
            <Animated.View
                entering={FadeInDown.delay(150).duration(500).springify()}
                style={styles.heroRow}
            >
                <View style={styles.numberBlock}>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakUnit}>day{streak !== 1 ? 's' : ''}</Text>
                </View>

                <Animated.View style={[styles.flameWrap, flameStyle]}>
                    <Flame
                        size={48}
                        color={streak > 0 ? colors.gold : colors.textGhost}
                        fill={streak > 0 ? `${colors.gold}40` : 'none'}
                        strokeWidth={1.5}
                    />
                </Animated.View>

                <View style={styles.ringBlock}>
                    <ProgressRing
                        progress={weeklyProgress}
                        size={68}
                        strokeWidth={5}
                        variant="gold"
                        label={`${weeklyDays.filter(Boolean).length}/7`}
                        sublabel="this week"
                    />
                </View>
            </Animated.View>

            {/* Today's status */}
            <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                style={styles.todayRow}
            >
                {todayDone ? (
                    <CheckCircle2 size={14} color={colors.emerald} strokeWidth={2} />
                ) : (
                    <Circle size={14} color={colors.textGhost} strokeWidth={1.5} />
                )}
                <Text style={[styles.todayText, todayDone && { color: colors.emerald }]}>
                    {todayDone ? "Today's check-in complete" : 'Complete a check-in to continue'}
                </Text>
            </Animated.View>

            {/* Weekly day dots */}
            <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                style={styles.weekRow}
            >
                {DAY_LABELS.map((day, i) => (
                    <View key={i} style={styles.dayItem}>
                        <View
                            style={[
                                styles.dayDot,
                                weeklyDays[i]
                                    ? { backgroundColor: colors.gold, shadowColor: colors.gold, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }
                                    : { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border },
                            ]}
                        />
                        <Text style={styles.dayLabel}>{day}</Text>
                    </View>
                ))}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    numberBlock: {
        alignItems: 'flex-start',
        flex: 1,
    },
    streakNumber: {
        fontFamily: fonts.displayBlack,
        fontSize: 64,
        color: colors.gold,
        lineHeight: 68,
        letterSpacing: -2,
    },
    streakUnit: {
        fontFamily: fonts.bodyLight,
        fontSize: 14,
        color: colors.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: -4,
    },
    flameWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringBlock: {
        flex: 1,
        alignItems: 'flex-end',
    },
    todayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    todayText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.xs,
    },
    dayItem: {
        alignItems: 'center',
        gap: 5,
    },
    dayDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        elevation: 3,
    },
    dayLabel: {
        fontFamily: fonts.bodyLight,
        fontSize: 10,
        color: colors.textGhost,
        letterSpacing: 0.5,
    },
});
