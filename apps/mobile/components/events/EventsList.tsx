/**
 * EventsList — Scrollable events list with nearby and virtual sections
 */

import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts, spacing } from '../../constants/theme';
import EventCard from './EventCard';
import {
    type EventResult,
    useEventBookmarks,
    useBookmarkEvent,
    useRemoveBookmark,
} from '../../hooks/useEvents';

interface EventsListProps {
    events: EventResult[];
    isLoading: boolean;
}

export default function EventsList({ events, isLoading }: EventsListProps) {
    const { data: bookmarks } = useEventBookmarks();
    const bookmarkEvent = useBookmarkEvent();
    const removeBookmark = useRemoveBookmark();

    const bookmarkedIds = new Set(bookmarks?.map((b) => b.event_id) || []);

    const nearbyEvents = events.filter((e) => !e.is_virtual);
    const virtualEvents = events.filter((e) => e.is_virtual);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.gold} />
                <Text style={styles.loadingText}>Finding events near you...</Text>
            </View>
        );
    }

    if (events.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🗺️</Text>
                <Text style={styles.emptyText}>
                    No events found nearby.{'\n'}Try expanding your search radius.
                </Text>
            </View>
        );
    }

    const handleBookmarkToggle = (event: EventResult) => {
        if (bookmarkedIds.has(event.event_id)) {
            removeBookmark.mutate(event.event_id);
        } else {
            bookmarkEvent.mutate(event);
        }
    };

    return (
        <View>
            {/* Nearby Events */}
            {nearbyEvents.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>📍 NEARBY</Text>
                    {nearbyEvents.map((event) => (
                        <EventCard
                            key={event.event_id}
                            event={event}
                            isBookmarked={bookmarkedIds.has(event.event_id)}
                            onBookmarkToggle={() => handleBookmarkToggle(event)}
                        />
                    ))}
                </View>
            )}

            {/* Virtual Events */}
            {virtualEvents.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>💻 NOT READY TO GO OUT?</Text>
                    <Text style={styles.sectionSubtitle}>Virtual events you can join from home</Text>
                    {virtualEvents.map((event) => (
                        <EventCard
                            key={event.event_id}
                            event={event}
                            isBookmarked={bookmarkedIds.has(event.event_id)}
                            onBookmarkToggle={() => handleBookmarkToggle(event)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: spacing.lg },
    sectionLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 12,
        color: colors.textGhost,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    sectionSubtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
    loadingContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    emptyContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
