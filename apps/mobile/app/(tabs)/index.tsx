/**
 * Home / Dashboard — Main tab screen (redesigned)
 *
 * Premium layout: AvatarRing greeting, StreakHero card, NudgeCards with
 * Lucide icons, section headers with vector icons, Sleep Mode with Moon icon.
 * Zero emoji — all replaced with Lucide vector icons.
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
    Music2, Zap, Headphones, Users, Moon, ChevronRight,
    Activity, Brain, Sparkles, Wind, Heart, Sun,
} from 'lucide-react-native';
import { colors, fonts, spacing, glass, borderRadius, shadows } from '../../constants/theme';
import { useYouTubeSearch } from '../../hooks/useMedia';
import { useEventSearch } from '../../hooks/useEvents';
import { useAdaptiveHome } from '../../hooks/useAdaptive';
import AudioCategoryCard from '../../components/media/AudioCategoryCard';
import YouTubeCard from '../../components/media/YouTubeCard';
import SleepMode from '../../components/media/SleepMode';
import EventsList from '../../components/events/EventsList';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';
import AvatarRing from '../../components/ui/AvatarRing';
import SectionHeader from '../../components/ui/SectionHeader';
import StreakHero from '../../components/ui/StreakHero';
import NudgeCard from '../../components/ui/NudgeCard';

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

// Map card type/action to Lucide icon
const NUDGE_ICON_MAP: Record<string, any> = {
    therapist_directory: Brain,
    journey: Activity,
    breathing: Wind,
    affirmation: Sparkles,
    default: Heart,
};

const AUDIO_CATEGORIES = [
    { category: 'breathing', Icon: Wind, label: 'Guided Breathing' },
    { category: 'meditation', Icon: Brain, label: 'Meditations' },
    { category: 'sleep', Icon: Moon, label: 'Sleep Sounds' },
    { category: 'affirmation', Icon: Sun, label: 'Morning Affirmations' },
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
                    <Animated.View entering={FadeIn.delay(200).duration(400)}>
                        <AvatarRing
                            initials="VR"
                            size={44}
                            pulse
                            style={{ marginTop: 4 }}
                        />
                    </Animated.View>
                </View>

                {/* Streak Hero Card */}
                <GlassCard accent="gold" delay={200} elevated shimmer glow>
                    <StreakHero
                        streak={0}
                        todayDone={false}
                        weeklyDays={[false, false, false, false, false, false, false]}
                    />
                </GlassCard>

                {/* Adaptive Nudge Cards */}
                {adaptiveData?.nudge_cards && adaptiveData.nudge_cards.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader
                            title="For You"
                            Icon={Sparkles}
                            iconColor={colors.gold}
                            delay={280}
                        />
                        {adaptiveData.nudge_cards.map((card: any, i: number) => {
                            const IconComp = NUDGE_ICON_MAP[card.action] ?? NUDGE_ICON_MAP.default;
                            const isTherapist = card.type === 'therapist';
                            return (
                                <NudgeCard
                                    key={i}
                                    title={card.title}
                                    message={card.message}
                                    Icon={IconComp}
                                    accent={isTherapist ? 'sapphire' : 'gold'}
                                    delay={300 + i * 80}
                                    onPress={() => {
                                        if (card.action === 'therapist_directory') {
                                            router.push('/therapist');
                                        } else if (card.action === 'journey') {
                                            router.push('/(tabs)/journey');
                                        }
                                    }}
                                />
                            );
                        })}
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <SectionHeader
                        title="How are you feeling?"
                        Icon={Heart}
                        iconColor={colors.crimson}
                        delay={400}
                    />
                    <GoldButton
                        label="Start a check-in"
                        onPress={() => router.push('/(tabs)/checkin')}
                    />
                </View>

                {/* Today's Habit */}
                <View style={styles.section}>
                    <SectionHeader title="Today's Habit" Icon={Activity} iconColor={colors.emerald} delay={500} />
                    <GlassCard delay={550} noAnimation>
                        <View style={styles.habitRow}>
                            <View style={styles.habitIconWrap}>
                                <Brain size={22} color={colors.lavender} strokeWidth={1.8} />
                            </View>
                            <Text style={styles.habitText}>
                                Complete a check-in to get your personalized plan
                            </Text>
                        </View>
                    </GlassCard>
                </View>

                {/* Your Vibe — YouTube */}
                {youtubeData && youtubeData.results.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="Your Vibe" Icon={Music2} iconColor={colors.sapphire} delay={600} />
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
                        <SectionHeader title="Get Fired Up" Icon={Zap} iconColor={colors.gold} delay={700} />
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

                {/* Audio Categories — Tonight's Wind-down */}
                <View style={styles.section}>
                    <SectionHeader title="Tonight's Wind-down" Icon={Headphones} iconColor={colors.lavender} delay={800} />
                    {AUDIO_CATEGORIES.map((cat) => (
                        <AudioCategoryCard
                            key={cat.category}
                            category={cat.category}
                            emoji=""
                            label={cat.label}
                        />
                    ))}
                </View>

                {/* Get out & connect — Events */}
                <View style={styles.section}>
                    <SectionHeader title="Get Out & Connect" Icon={Users} iconColor={colors.emerald} delay={900} />
                    <EventsList
                        events={eventsData?.events || []}
                        isLoading={eventsLoading}
                    />
                </View>

                {/* Sleep Mode */}
                <View style={styles.section}>
                    <GlassCard accent="sapphire" delay={1000} shimmer onPress={() => setShowSleepMode(true)}>
                        <View style={styles.sleepRow}>
                            <View style={styles.sleepIconWrap}>
                                <Moon size={24} color={colors.sapphire} strokeWidth={1.8} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sleepTitle}>Sleep Mode</Text>
                                <Text style={styles.sleepSubtitle}>
                                    Dim lights, breathing, auto-stop
                                </Text>
                            </View>
                            <ChevronRight size={18} color={colors.textGhost} strokeWidth={1.5} />
                        </View>
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
        paddingBottom: 120,
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
        fontSize: 12,
        color: colors.textGhost,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    name: {
        fontFamily: fonts.display,
        fontSize: 26,
        color: colors.textPrimary,
        marginTop: 4,
    },
    // Sections
    section: { marginTop: spacing.lg },
    // Habit
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    habitIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${colors.lavender}15`,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    habitText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        flex: 1,
    },
    // Sleep Mode
    sleepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sleepIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${colors.sapphire}15`,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
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
});
