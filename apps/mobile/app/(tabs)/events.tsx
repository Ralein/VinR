/**
 * Events Tab — Dedicated events screen
 *
 * Full-screen scrollable events page with nearby + virtual events.
 * Reuses existing EventsList component and useEventSearch hook.
 * Zero emoji — all Lucide vector icons.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar, MapPin } from 'lucide-react-native';
import { fonts, spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useEventSearch } from '../../hooks/useEvents';
import EventsList from '../../components/events/EventsList';

export default function EventsScreen() {
    const { colors } = useTheme();
    const { data: eventsData, isLoading } = useEventSearch(40.7128, -74.006);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.header}>
                <View style={styles.headerRow}>
                    <View style={[styles.iconWrap, { backgroundColor: `${colors.emerald}15` }]}>
                        <Calendar size={22} color={colors.emerald} strokeWidth={1.8} />
                    </View>
                    <View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Events</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={11} color={colors.textGhost} strokeWidth={2} />
                            <Text style={[styles.locationText, { color: colors.textGhost }]}>Near you</Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Discover wellness events, workshops, and community gatherings near you.
                </Text>
            </Animated.View>

            {/* Events List */}
            <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.listContainer}>
                <EventsList
                    events={eventsData?.events || []}
                    isLoading={isLoading}
                />
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 10,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 28,
        letterSpacing: -0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    locationText: {
        fontFamily: fonts.body,
        fontSize: 12,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: 14,
        lineHeight: 20,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
});
