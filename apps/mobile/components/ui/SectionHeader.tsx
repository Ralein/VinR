/**
 * SectionHeader — Premium section title with badge and "See all" action
 *
 * Replaces inline emoji + Animated.Text section title pattern throughout the app.
 * Supports optional badge count, Lucide icon, and overflow link.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { type LucideIcon } from 'lucide-react-native';
import { colors, fonts, spacing } from '../../constants/theme';

interface SectionHeaderProps {
    title: string;
    Icon?: LucideIcon;
    badge?: string | number;
    onSeeAll?: () => void;
    delay?: number;
    /** Dim the icon color for subtlety */
    iconColor?: string;
}

export default function SectionHeader({
    title,
    Icon,
    badge,
    onSeeAll,
    delay = 0,
    iconColor = colors.gold,
}: SectionHeaderProps) {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(400)}
            style={styles.container}
        >
            <View style={styles.left}>
                {Icon && <Icon size={20} color={iconColor} style={styles.icon} />}
                <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                {badge !== undefined && (
                    <View style={[styles.badge, { backgroundColor: colors.goldMuted }]}>
                        <Text style={[styles.badgeText, { color: colors.gold }]}>{badge}</Text>
                    </View>
                )}
            </View>

            {onSeeAll && (
                <Pressable onPress={onSeeAll} style={({ pressed }) => [
                    styles.seeAll,
                    pressed && { opacity: 0.7 }
                ]}>
                    <Text style={[styles.seeAllText, { color: colors.gold }]}>See all</Text>
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: spacing.sm,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 20,
        letterSpacing: 0.3,
    },
    badge: {
        marginLeft: spacing.sm,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontFamily: fonts.mono,
        fontSize: 10,
        fontWeight: 'bold',
    },
    seeAll: {
        paddingVertical: spacing.xs,
    },
    seeAllText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
    },
});
