/**
 * Home / Dashboard — Main tab screen
 * Includes streak badge, quick actions, media sections, and events
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useYouTubeSearch } from '../../hooks/useMedia';
import { useEventSearch } from '../../hooks/useEvents';
import { useAdaptiveHome } from '../../hooks/useAdaptive';
import AudioCategoryCard from '../../components/media/AudioCategoryCard';
import YouTubeCard from '../../components/media/YouTubeCard';
import SleepMode from '../../components/media/SleepMode';
import EventsList from '../../components/events/EventsList';

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

const AUDIO_CATEGORIES = [
    { category: 'breathing', emoji: '🫁', label: 'Guided Breathing' },
    { category: 'meditation', emoji: '🧘', label: 'Meditations' },
    { category: 'sleep', emoji: '🌙', label: 'Sleep Sounds' },
    { category: 'affirmation', emoji: '☀️', label: 'Morning Affirmations' },
];

export default function HomeScreen() {
    const [showSleepMode, setShowSleepMode] = useState(false);
    const { data: adaptiveData } = useAdaptiveHome();

    // YouTube section — uses first genre by default
    const { data: youtubeData } = useYouTubeSearch('Pop', 'music');
    const { data: motivationData } = useYouTubeSearch('Pop', 'motivation');

    // Events — using NYC coordinates as default (will use user location in production)
    const { data: eventsData, isLoading: eventsLoading } = useEventSearch(40.7128, -74.006);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Greeting */}
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.name}>Welcome to VinR</Text>

                {/* Streak Badge */}
                <View style={styles.streakCard}>
                    <Text style={styles.streakNumber}>0</Text>
                    <Text style={styles.streakLabel}>day streak 🔥</Text>
                </View>

                {/* Adaptive Nudge Cards */}
                {adaptiveData?.nudge_cards && adaptiveData.nudge_cards.length > 0 && (
                    <View style={styles.section}>
                        {adaptiveData.nudge_cards.map((card, i) => (
                            <Pressable
                                key={i}
                                style={({ pressed }) => [
                                    styles.nudgeCard,
                                    card.type === 'therapist' && styles.nudgeCardTherapist,
                                    pressed && { opacity: 0.85 },
                                ]}
                                onPress={() => {
                                    if (card.action === 'therapist_directory') {
                                        router.push('/therapist');
                                    } else if (card.action === 'journey') {
                                        router.push('/(tabs)/journey');
                                    }
                                }}
                            >
                                <Text style={styles.nudgeEmoji}>{card.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nudgeTitle}>{card.title}</Text>
                                    <Text style={styles.nudgeMessage}>{card.message}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How are you feeling?</Text>
                    <Pressable
                        style={styles.quickAction}
                        onPress={() => router.push('/(tabs)/checkin')}
                    >
                        <Text style={styles.quickActionText}>Start a check-in →</Text>
                    </Pressable>
                </View>

                {/* Today's Habit */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today's Habit</Text>
                    <View style={styles.habitCard}>
                        <Text style={styles.habitEmoji}>🧘</Text>
                        <Text style={styles.habitText}>
                            Complete a check-in to get your personalized plan
                        </Text>
                    </View>
                </View>

                {/* Your Vibe — YouTube */}
                {youtubeData && youtubeData.results.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎵 Your Vibe</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {youtubeData.results.map((video) => (
                                <YouTubeCard
                                    key={video.video_id}
                                    videoId={video.video_id}
                                    title={video.title}
                                    channel={video.channel}
                                    thumbnailUrl={video.thumbnail_url}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Get Fired Up — Motivation */}
                {motivationData && motivationData.results.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔥 Get Fired Up</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {motivationData.results.map((video) => (
                                <YouTubeCard
                                    key={video.video_id}
                                    videoId={video.video_id}
                                    title={video.title}
                                    channel={video.channel}
                                    thumbnailUrl={video.thumbnail_url}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Audio Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎧 Tonight's Wind-down</Text>
                    {AUDIO_CATEGORIES.map((cat) => (
                        <AudioCategoryCard
                            key={cat.category}
                            category={cat.category}
                            emoji={cat.emoji}
                            label={cat.label}
                        />
                    ))}
                </View>

                {/* Get out & connect — Events */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🤝 Get out & connect</Text>
                    <EventsList
                        events={eventsData?.events || []}
                        isLoading={eventsLoading}
                    />
                </View>

                {/* Sleep Mode */}
                <View style={styles.section}>
                    <Pressable
                        style={styles.sleepModeButton}
                        onPress={() => setShowSleepMode(true)}
                    >
                        <Text style={styles.sleepModeEmoji}>🌙</Text>
                        <View>
                            <Text style={styles.sleepModeTitle}>Sleep Mode</Text>
                            <Text style={styles.sleepModeSubtitle}>
                                Dim lights, breathing, auto-stop
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>

            <SleepMode visible={showSleepMode} onClose={() => setShowSleepMode(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl + spacing.xxl,
    },
    greeting: {
        fontFamily: fonts.bodyLight,
        fontSize: 14,
        color: colors.textMuted,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    name: {
        fontFamily: fonts.display,
        fontSize: 28,
        color: colors.textPrimary,
        marginTop: 4,
        marginBottom: spacing.lg,
    },
    streakCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.xl,
    },
    streakNumber: {
        fontSize: 48,
        color: colors.gold,
        fontWeight: '900',
    },
    streakLabel: {
        fontFamily: fonts.body,
        fontSize: 16,
        color: colors.textMuted,
        marginTop: 4,
    },
    section: { marginBottom: spacing.lg },
    sectionTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    quickAction: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    quickActionText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.void,
    },
    habitCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md + 4,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    habitEmoji: { fontSize: 32, marginRight: spacing.md },
    habitText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
        flex: 1,
    },
    sleepModeButton: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gold + '30',
    },
    sleepModeEmoji: { fontSize: 32, marginRight: spacing.md },
    sleepModeTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.textPrimary,
    },
    sleepModeSubtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textGhost,
    },
    nudgeCard: {
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, flexDirection: 'row', alignItems: 'center',
        gap: spacing.sm, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.goldGlow,
    },
    nudgeCardTherapist: {
        borderColor: colors.sapphire + '30',
        backgroundColor: colors.sapphire + '08',
    },
    nudgeEmoji: { fontSize: 28 },
    nudgeTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 15,
        color: colors.textPrimary,
    },
    nudgeMessage: {
        fontFamily: fonts.body, fontSize: 13,
        color: colors.textMuted, marginTop: 2,
    },
});
