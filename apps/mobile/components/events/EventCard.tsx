/**
 * EventCard — Event card with venue, date, distance, category, bookmark
 */

import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { type EventResult } from '../../hooks/useEvents';

const CATEGORY_EMOJIS: Record<string, string> = {
    yoga: '🧘',
    meditation: '🧘‍♀️',
    breathwork: '🫁',
    'support group': '💙',
    outdoor: '🏞️',
    hiking: '🥾',
    walking: '🚶',
    'art therapy': '🎨',
    fitness: '💪',
    wellness: '✨',
    mindfulness: '🕉️',
    'self-care': '🛁',
    social: '👋',
};

interface EventCardProps {
    event: EventResult;
    isBookmarked?: boolean;
    onBookmarkToggle?: () => void;
}

export default function EventCard({ event, isBookmarked, onBookmarkToggle }: EventCardProps) {
    const categoryEmoji = CATEGORY_EMOJIS[event.category || ''] || '✨';

    const handlePress = () => {
        if (event.url) {
            Linking.openURL(event.url);
        }
    };

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            <View style={styles.topRow}>
                {/* Category chip */}
                <View style={styles.categoryChip}>
                    <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
                    <Text style={styles.categoryText}>{event.category || 'wellness'}</Text>
                </View>

                {/* Bookmark */}
                {onBookmarkToggle && (
                    <Pressable onPress={onBookmarkToggle} style={styles.bookmarkButton}>
                        <Text style={styles.bookmarkIcon}>
                            {isBookmarked ? '🔖' : '📌'}
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Event name */}
            <Text style={styles.name} numberOfLines={2}>{event.name}</Text>

            {/* Description */}
            {event.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {event.description}
                </Text>
            )}

            {/* Details row */}
            <View style={styles.detailsRow}>
                {event.venue && (
                    <View style={styles.detail}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.detailText} numberOfLines={1}>
                            {event.venue}
                        </Text>
                    </View>
                )}
                {event.date && (
                    <View style={styles.detail}>
                        <Text style={styles.detailIcon}>📅</Text>
                        <Text style={styles.detailText} numberOfLines={1}>
                            {event.date}
                        </Text>
                    </View>
                )}
                {event.distance_miles !== null && event.distance_miles !== undefined && (
                    <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>
                            {event.distance_miles.toFixed(1)} mi
                        </Text>
                    </View>
                )}
            </View>

            {/* Virtual badge */}
            {event.is_virtual && (
                <View style={styles.virtualBadge}>
                    <Text style={styles.virtualText}>💻 Virtual Event</Text>
                </View>
            )}
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
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs,
    },
    categoryEmoji: { fontSize: 14, marginRight: 4 },
    categoryText: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textMuted,
        textTransform: 'capitalize',
    },
    bookmarkButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookmarkIcon: { fontSize: 18 },
    name: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
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
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: { fontSize: 12, marginRight: 4 },
    detailText: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textGhost,
        maxWidth: 120,
    },
    distanceBadge: {
        backgroundColor: colors.gold + '15',
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
        marginTop: spacing.sm,
        backgroundColor: colors.sapphire + '15',
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        alignSelf: 'flex-start',
    },
    virtualText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 12,
        color: colors.sapphire,
    },
});
