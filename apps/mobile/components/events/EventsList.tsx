import React from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import EventCard from './EventCard';
import { 
    type EventResult, 
    useEventBookmarks, 
    useBookmarkEvent, 
    useRemoveBookmark 
} from '../../hooks/useEvents';

interface EventsListProps {
    events: EventResult[];
    isLoading: boolean;
}

export default function EventsList({
    events,
    isLoading
}: EventsListProps) {
    const { colors, fonts, spacing } = useTheme();
    const { data: bookmarks } = useEventBookmarks();
    const bookmarkEvent = useBookmarkEvent();
    const removeBookmark = useRemoveBookmark();

    const bookmarkedIds = new Set(bookmarks?.map((b) => b.event_id.toString()) || []);

    const handleToggleBookmark = (event: EventResult) => {
        const idStr = event.event_id.toString();
        if (bookmarkedIds.has(idStr)) {
            removeBookmark.mutate(event.event_id);
        } else {
            bookmarkEvent.mutate(event);
        }
    };

    /**
     * Grouping logic:
     * - "Nearby Events"
     * - "Virtual Experiences"
     */
    const sections = [
        {
            title: 'Nearby Wellness',
            description: 'In-person events and safe spaces near you',
            data: events.filter(e => !e.is_virtual),
        },
        {
            title: 'Digital Sanctuaries',
            description: 'Guided sessions & workshops you can join from anywhere',
            data: events.filter(e => e.is_virtual),
        },
    ].filter(s => s.data.length > 0);

    if (isLoading && events.length === 0) {
        return (
            <View style={[styles.center, { padding: spacing.xl }]}>
                <ActivityIndicator color={colors.gold} />
                <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: fonts.body, marginTop: spacing.md }]}>Gathering local sanctuaries...</Text>
            </View>
        );
    }

    if (events.length === 0) {
        return (
            <View style={[styles.center, { padding: spacing.xl, gap: spacing.md }]}>
                <MapPinOff size={48} color={colors.textGhost} strokeWidth={1} />
                <View style={styles.emptyTextCol}>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>No events found</Text>
                    <Text style={[styles.emptySub, { color: colors.textMuted, fontFamily: fonts.body }]}>
                        We couldn't find any events matching your criteria. Try adjusting your preferences or check back later!
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.event_id}-${index}`}
            renderItem={({ item }) => (
                <EventCard
                    event={item}
                    isBookmarked={bookmarkedIds.has(item.event_id.toString())}
                    onBookmarkToggle={() => handleToggleBookmark(item)}
                />
            )}
            renderSectionHeader={({ section: { title, description } }) => (
                <View style={[styles.header, { backgroundColor: colors.void, paddingVertical: spacing.md }]}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>{title}</Text>
                    <Text style={[styles.headerDesc, { color: colors.textMuted, fontFamily: fonts.body }]}>{description}</Text>
                </View>
            )}
            contentContainerStyle={[styles.listContent, { padding: spacing.md, paddingBottom: 100 }]}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
    },
    header: {
        gap: 4,
    },
    headerTitle: {
        fontSize: 18,
        letterSpacing: -0.3,
    },
    headerDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 14,
    },
    emptyTextCol: {
        alignItems: 'center',
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
    },
    emptySub: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});

