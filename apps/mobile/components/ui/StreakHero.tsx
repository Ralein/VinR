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
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';
import ProgressRing from './ProgressRing';

interface StreakHeroProps {
    streak: number;
    todayDone: boolean;
    weeklyDays: boolean[];
}

export default function StreakHero({ streak, todayDone, weeklyDays }: StreakHeroProps) {
    const { colors } = useTheme();
    
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
        } else {
            flamePulse.value = 1;
        }
    }, [streak]);

    const flameStyle = useAnimatedStyle(() => ({
        transform: [{ scale: flamePulse.value }],
    }));

    const weeklyProgress = (weeklyDays?.filter(Boolean).length || 0) / 7;
    const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconWrap, { backgroundColor: `${colors.gold}15` }]}>
                    <Animated.View style={flameStyle}>
                        <Flame size={32} color={colors.gold} fill={streak > 0 ? colors.gold : 'transparent'} />
                    </Animated.View>
                </View>
                <View style={styles.countContainer}>
                    <Text style={[styles.count, { color: colors.textPrimary }]}>{streak}</Text>
                    <Text style={[styles.label, { color: colors.textMuted }]}>DAY STREAK</Text>
                </View>
                <View style={styles.weeklyRing}>
                    <ProgressRing 
                        progress={weeklyProgress} 
                        size={60} 
                        strokeWidth={6} 
                        variant="gold"
                    />
                    <View style={styles.ringCenter}>
                        {todayDone ? (
                            <CheckCircle2 size={20} color={colors.gold} />
                        ) : (
                            <Text style={[styles.miniLabel, { color: colors.gold }]}>
                                {Math.round(weeklyProgress * 7)}/7
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.daysRow}>
                {DAY_LABELS.map((day, i) => (
                    <View key={i} style={styles.dayCol}>
                        <View style={[
                            styles.dayIndicator, 
                            { 
                                backgroundColor: weeklyDays[i] ? colors.gold : `${colors.gold}10`,
                                borderColor: weeklyDays[i] ? colors.gold : `${colors.gold}30`,
                            }
                        ]}>
                            {weeklyDays[i] && <CheckCircle2 size={10} color={colors.surface} />}
                        </View>
                        <Text style={[
                            styles.dayText, 
                            { color: weeklyDays[i] ? colors.gold : colors.textMuted }
                        ]}>
                            {day}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: spacing.lg,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    count: {
        fontFamily: fonts.display,
        fontSize: 36,
        lineHeight: 40,
    },
    label: {
        fontFamily: fonts.mono,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    weeklyRing: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniLabel: {
        fontFamily: fonts.mono,
        fontSize: 10,
        fontWeight: 'bold',
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    dayCol: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    dayIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 10,
    },
});
