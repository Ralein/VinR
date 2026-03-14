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
        <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.row}>
            <View style={styles.left}>
                {Icon && (
                    <View style={[styles.iconBox, { backgroundColor: `${iconColor}18` }]}>
                        <Icon size={14} color={iconColor} strokeWidth={2.2} />
                    </View>
                )}
                <Text style={styles.title}>{title}</Text>
                {badge !== undefined && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            {onSeeAll && (
                <Pressable onPress={onSeeAll} hitSlop={8}>
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 18,
        color: colors.textPrimary,
        letterSpacing: -0.1,
    },
    badge: {
        backgroundColor: colors.goldMuted,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.gold,
    },
    seeAll: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
    },
});
