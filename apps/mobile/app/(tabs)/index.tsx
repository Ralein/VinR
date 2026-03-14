/**
 * Home / Dashboard — Main tab screen
 *
 * Premium layout: greeting, streak hero card, adaptive nudges,
 * quick actions, media sections, events, and sleep mode.
 * Uses GlassCard components and staggered entrance animations.
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { useYouTubeSearch } from '../../hooks/useMedia';
import { useEventSearch } from '../../hooks/useEvents';
import { useAdaptiveHome } from '../../hooks/useAdaptive';
import AudioCategoryCard from '../../components/media/AudioCategoryCard';
import YouTubeCard from '../../components/media/YouTubeCard';
import SleepMode from '../../components/media/SleepMode';
import EventsList from '../../components/events/EventsList';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';

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

    const { data: youtubeData } = useYouTubeSearch('Pop', 'music');
    const { data: motivationData } = useYouTubeSearch('Pop', 'motivation');
    const { data: eventsData, isLoading: eventsLoading } = useEventSearch(40.7128, -74.006);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerText}>
                        <Animated.Text entering={FadeIn.duration(400)} style={styles.greeting}>
                            {getGreeting()}
                        </Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.name}>
                            Welcome to VinR
                        </Animated.Text>
                    </View>
                    {/* Profile Avatar */}
                    <Animated.View entering={FadeIn.delay(200).duration(400)}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>👤</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* Streak Badge — Hero Card */}
                <GlassCard accent="gold" delay={200} elevated>
                    <View style={styles.streakInner}>
                        <Text style={styles.streakNumber}>0</Text>
                        <Text style={styles.streakLabel}>day streak 🔥</Text>
                        <Text style={styles.streakSubtitle}>Complete a check-in to start</Text>
                    </View>
                </GlassCard>

                {/* Adaptive Nudge Cards */}
                {adaptiveData?.nudge_cards && adaptiveData.nudge_cards.length > 0 && (
                    <View style={styles.section}>
                        {adaptiveData.nudge_cards.map((card: any, i: number) => (
                            <GlassCard
                                key={i}
                                accent={card.type === 'therapist' ? 'sapphire' : 'gold'}
                                accentBorder
                                delay={300 + i * 100}
                            >
                                <Pressable
                                    style={styles.nudgeInner}
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
                            </GlassCard>
                        ))}
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Animated.Text entering={FadeInDown.delay(400).duration(400)} style={styles.sectionTitle}>
                        How are you feeling?
                    </Animated.Text>
                    <GoldButton
                        label="Start a check-in →"
                        onPress={() => router.push('/(tabs)/checkin')}
                    />
                </View>

                {/* Today's Habit */}
                <View style={styles.section}>
                    <Animated.Text entering={FadeInDown.delay(500).duration(400)} style={styles.sectionTitle}>
                        Today's Habit
                    </Animated.Text>
                    <GlassCard delay={550}>
                        <View style={styles.habitRow}>
                            <Text style={styles.habitEmoji}>🧘</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.habitText}>
                                    Complete a check-in to get your personalized plan
                                </Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>

                {/* Your Vibe — YouTube */}
                {youtubeData && youtubeData.results.length > 0 && (
                    <View style={styles.section}>
                        <Animated.Text entering={FadeInDown.delay(600).duration(400)} style={styles.sectionTitle}>
                            🎵 Your Vibe
                        </Animated.Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {youtubeData.results.map((video: any) => (
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
                        <Animated.Text entering={FadeInDown.delay(700).duration(400)} style={styles.sectionTitle}>
                            🔥 Get Fired Up
                        </Animated.Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {motivationData.results.map((video: any) => (
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
                    <Animated.Text entering={FadeInDown.delay(800).duration(400)} style={styles.sectionTitle}>
                        🎧 Tonight's Wind-down
                    </Animated.Text>
                    {AUDIO_CATEGORIES.map((cat, i) => (
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
                    <Animated.Text entering={FadeInDown.delay(900).duration(400)} style={styles.sectionTitle}>
                        🤝 Get out & connect
                    </Animated.Text>
                    <EventsList
                        events={eventsData?.events || []}
                        isLoading={eventsLoading}
                    />
                </View>

                {/* Sleep Mode */}
                <View style={styles.section}>
                    <GlassCard accent="gold" delay={1000}>
                        <Pressable
                            style={styles.sleepRow}
                            onPress={() => setShowSleepMode(true)}
                        >
                            <Text style={styles.sleepEmoji}>🌙</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sleepTitle}>Sleep Mode</Text>
                                <Text style={styles.sleepSubtitle}>
                                    Dim lights, breathing, auto-stop
                                </Text>
                            </View>
                            <Text style={styles.chevron}>→</Text>
                        </Pressable>
                    </GlassCard>
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
        paddingBottom: spacing['2xl'] + spacing['2xl'],
    },
    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    headerText: { flex: 1 },
    greeting: {
        fontFamily: fonts.bodyLight,
        fontSize: 13,
        color: colors.textMuted,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    name: {
        fontFamily: fonts.display,
        fontSize: 28,
        color: colors.textPrimary,
        marginTop: 4,
    },
    avatarRing: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: colors.gold,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 18 },
    // Streak Hero
    streakInner: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    streakNumber: {
        fontSize: 56,
        color: colors.gold,
        fontWeight: '900',
        lineHeight: 64,
    },
    streakLabel: {
        fontFamily: fonts.body,
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 2,
    },
    streakSubtitle: {
        fontFamily: fonts.bodyLight,
        fontSize: 12,
        color: colors.textGhost,
        marginTop: 4,
    },
    // Sections
    section: { marginTop: spacing.lg },
    sectionTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    // Nudge
    nudgeInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
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
    // Habit
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    habitEmoji: { fontSize: 32 },
    habitText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    // Sleep Mode
    sleepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sleepEmoji: { fontSize: 32 },
    sleepTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.textPrimary,
    },
    sleepSubtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    chevron: {
        fontFamily: fonts.body,
        fontSize: 20,
        color: colors.textGhost,
    },
});
