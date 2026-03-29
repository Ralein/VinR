import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import {
    Wind, Brain, Leaf, Users, Trees, Footprints, PersonStanding,
    Palette, Dumbbell, Sparkles, Heart, Sun, Bookmark, MapPin,
    CalendarDays, Monitor, ExternalLink,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { type EventResult } from '../../hooks/useEvents';

interface EventCardProps {
    event: EventResult;
    isBookmarked?: boolean;
    onBookmarkToggle?: () => void;
}

export default function EventCard({ event, isBookmarked, onBookmarkToggle }: EventCardProps) {
    const { colors, fonts, spacing, borderRadius, isDark } = useTheme();

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
            <Animated.View style={[
                styles.container, 
                { 
                    backgroundColor: isDark ? colors.surface : '#FAF8F4', 
                    borderColor: isDark ? colors.border : '#E8E1D0',
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                }, 
                animStyle
            ]}>
                <View style={styles.topRow}>
                    <View style={[styles.categoryChip, { backgroundColor: isDark ? `${catColor}12` : `${catColor}15`, borderColor: isDark ? `${catColor}25` : `${catColor}30`, borderRadius: borderRadius.full }]}>
                        <CatIcon size={12} color={catColor} strokeWidth={2} />
                        <Text style={[styles.categoryText, { color: catColor, fontFamily: fonts.bodySemiBold }]}>
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
                <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]} numberOfLines={2}>{event.name}</Text>

                {/* Description */}
                {event.description && (
                    <Text style={[styles.description, { color: colors.textMuted, fontFamily: fonts.body, marginBottom: spacing.sm }]} numberOfLines={2}>{event.description}</Text>
                )}

                {/* Details row */}
                <View style={[styles.detailsRow, { gap: spacing.md }]}>
                    {event.venue && (
                        <View style={styles.detail}>
                            <MapPin size={11} color={colors.textGhost} strokeWidth={1.8} />
                            <Text style={[styles.detailText, { color: colors.textGhost, fontFamily: fonts.body }]} numberOfLines={1}>{event.venue}</Text>
                        </View>
                    )}
                    {event.date && (
                        <View style={styles.detail}>
                            <CalendarDays size={11} color={colors.textGhost} strokeWidth={1.8} />
                            <Text style={[styles.detailText, { color: colors.textGhost, fontFamily: fonts.body }]} numberOfLines={1}>{event.date}</Text>
                        </View>
                    )}
                    {event.distance_miles != null && (
                        <View style={[styles.distanceBadge, { backgroundColor: `${colors.gold}15`, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm }]}>
                            <Text style={[styles.distanceText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>{event.distance_miles.toFixed(1)} mi</Text>
                        </View>
                    )}
                </View>

                {/* Virtual badge */}
                {event.is_virtual && (
                    <View style={[styles.virtualBadge, { backgroundColor: `${colors.sapphire}12`, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, marginTop: spacing.sm }]}>
                        <Monitor size={11} color={colors.sapphire} strokeWidth={2} />
                        <Text style={[styles.virtualText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>Virtual Event</Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderWidth: 1,
    },
    categoryText: {
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
        fontSize: 15,
        marginBottom: 4,
        lineHeight: 21,
    },
    description: {
        fontSize: 13,
        lineHeight: 19,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    detail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: {
        fontSize: 12,
        maxWidth: 120,
    },
    distanceBadge: {
        paddingVertical: 2,
    },
    distanceText: {
        fontSize: 11,
    },
    virtualBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    virtualText: {
        fontSize: 11,
    },
});

