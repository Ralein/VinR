/**
 * EventsList v2 — Emoji-free section labels with Lucide icons
 */

import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin, Wifi, Map } from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
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

    const handleBookmarkToggle = (event: EventResult) => {
        if (bookmarkedIds.has(event.event_id)) {
            removeBookmark.mutate(event.event_id);
        } else {
            bookmarkEvent.mutate(event);
        }
    };

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
                <View style={styles.emptyIconWrap}>
                    <Map size={32} color={colors.textGhost} strokeWidth={1.4} />
                </View>
                <Text style={styles.emptyTitle}>No Events Found</Text>
                <Text style={styles.emptyText}>Try expanding your search radius.</Text>
            </View>
        );
    }

    return (
        <View>
            {nearbyEvents.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <MapPin size={12} color={colors.emerald} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.emerald }]}>NEARBY</Text>
                    </View>
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

            {virtualEvents.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionLabelRow}>
                        <Wifi size={12} color={colors.sapphire} strokeWidth={2} />
                        <Text style={[styles.sectionLabel, { color: colors.sapphire }]}>ONLINE — JOIN FROM HOME</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>Virtual events you can join from anywhere</Text>
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
    sectionLabelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginBottom: spacing.sm,
    },
    sectionLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    sectionSubtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: spacing.md,
        marginTop: -4,
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
        gap: 8,
    },
    emptyIconWrap: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: colors.elevated,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.textMuted,
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textGhost,
        textAlign: 'center',
    },
});
