/**
 * EventCard v2 — Emoji-free, Lucide icon category chips + bookmark
 */

import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import {
    Wind, Brain, Leaf, Users, Trees, Footprints, PersonStanding,
    Palette, Dumbbell, Sparkles, Heart, Sun, Bookmark, MapPin,
    CalendarDays, Monitor, ExternalLink,
} from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { type EventResult } from '../../hooks/useEvents';

// Map category → Lucide icon + accent color
const CATEGORY_CONFIG: Record<string, { Icon: any; color: string }> = {
    yoga:            { Icon: PersonStanding, color: colors.lavender },
    meditation:      { Icon: Brain,          color: colors.sapphire },
    breathwork:      { Icon: Wind,           color: colors.emerald  },
    'support group': { Icon: Users,          color: colors.sapphire },
    outdoor:         { Icon: Trees,          color: colors.emerald  },
    hiking:          { Icon: Footprints,     color: colors.emerald  },
    walking:         { Icon: Footprints,     color: colors.gold     },
    'art therapy':   { Icon: Palette,        color: colors.lavender },
    fitness:         { Icon: Dumbbell,       color: colors.crimson  },
    wellness:        { Icon: Sparkles,       color: colors.gold     },
    mindfulness:     { Icon: Heart,          color: colors.crimson  },
    'self-care':     { Icon: Sun,            color: colors.gold     },
    social:          { Icon: Users,          color: colors.emerald  },
};
const DEFAULT_CONFIG = { Icon: Sparkles, color: colors.gold };

interface EventCardProps {
    event: EventResult;
    isBookmarked?: boolean;
    onBookmarkToggle?: () => void;
}

export default function EventCard({ event, isBookmarked, onBookmarkToggle }: EventCardProps) {
    const cfg = CATEGORY_CONFIG[event.category || ''] ?? DEFAULT_CONFIG;
    const { Icon: CatIcon, color: catColor } = cfg;

    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 300, damping: 20 }) }],
    }));

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.975; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={() => event.url && Linking.openURL(event.url)}
        >
            <Animated.View style={[styles.container, animStyle]}>
                {/* Top row */}
                <View style={styles.topRow}>
                    <View style={[styles.categoryChip, { backgroundColor: `${catColor}12`, borderColor: `${catColor}25` }]}>
                        <CatIcon size={12} color={catColor} strokeWidth={2} />
                        <Text style={[styles.categoryText, { color: catColor }]}>
                            {event.category || 'wellness'}
                        </Text>
                    </View>
                    <View style={styles.topRowRight}>
                        {event.url && (
                            <ExternalLink size={12} color={colors.textGhost} strokeWidth={1.5} />
                        )}
                        {onBookmarkToggle && (
                            <Pressable onPress={onBookmarkToggle} style={styles.bookmarkBtn} hitSlop={8}>
                                <Bookmark
                                    size={16}
                                    color={isBookmarked ? colors.gold : colors.textGhost}
                                    fill={isBookmarked ? colors.gold : 'none'}
                                    strokeWidth={1.8}
                                />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Name */}
                <Text style={styles.name} numberOfLines={2}>{event.name}</Text>

                {/* Description */}
                {event.description && (
                    <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
                )}

                {/* Details row */}
                <View style={styles.detailsRow}>
                    {event.venue && (
                        <View style={styles.detail}>
                            <MapPin size={11} color={colors.textGhost} strokeWidth={1.8} />
                            <Text style={styles.detailText} numberOfLines={1}>{event.venue}</Text>
                        </View>
                    )}
                    {event.date && (
                        <View style={styles.detail}>
                            <CalendarDays size={11} color={colors.textGhost} strokeWidth={1.8} />
                            <Text style={styles.detailText} numberOfLines={1}>{event.date}</Text>
                        </View>
                    )}
                    {event.distance_miles != null && (
                        <View style={styles.distanceBadge}>
                            <Text style={styles.distanceText}>{event.distance_miles.toFixed(1)} mi</Text>
                        </View>
                    )}
                </View>

                {/* Virtual badge */}
                {event.is_virtual && (
                    <View style={styles.virtualBadge}>
                        <Monitor size={11} color={colors.sapphire} strokeWidth={2} />
                        <Text style={styles.virtualText}>Virtual Event</Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: borderRadius.full,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderWidth: 1,
    },
    categoryText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        textTransform: 'capitalize',
        letterSpacing: 0.2,
    },
    topRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bookmarkBtn: {
        width: 28, height: 28,
        alignItems: 'center', justifyContent: 'center',
    },
    name: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 4,
        lineHeight: 21,
    },
    description: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 19,
        marginBottom: spacing.sm,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing.md,
    },
    detail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textGhost,
        maxWidth: 120,
    },
    distanceBadge: {
        backgroundColor: `${colors.gold}15`,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    distanceText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.gold,
    },
    virtualBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: spacing.sm,
        backgroundColor: `${colors.sapphire}12`,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    virtualText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: colors.sapphire,
    },
});
