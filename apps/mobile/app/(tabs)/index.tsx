/**
 * Home / Dashboard v3 — Premium animated home screen
 *
 * - Date chip + time-based greeting with staggered FadeInDown
 * - Daily quote pill (italic, Cormorant font)
 * - Streak hero with glowing gold card
 * - Adaptive nudge cards with spring entrance
 * - AudioCategoryCard: now uses Icon prop (no emoji)
 * - Every section staggered for cinematic entrance
 * - Zero emoji — all icons are Lucide vector
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
    Music2, Zap, Headphones, Users, Moon, ChevronRight,
    Activity, Brain, Sparkles, Wind, Heart, Sun, Quote,
    CalendarDays, TrendingUp,
} from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useYouTubeSearch } from '../../hooks/useMedia';
import { useEventSearch } from '../../hooks/useEvents';
import { useStreak } from '../../hooks/useStreak';
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

// ── Utilities ──────────────────────────────────────────────

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 5)  return 'Late night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function getDateChip(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
    });
}

const DAILY_QUOTES = [
    'Small steps every day lead to seismic change.',
    'Healing is not linear — every moment counts.',
    'You showed up today. That already matters.',
    'Be patient and gentle with yourself.',
    'Progress, not perfection.',
] as const;

function getDailyQuote() {
    const day = new Date().getDate();
    return DAILY_QUOTES[day % DAILY_QUOTES.length];
}

// ── Nudge icon map ──────────────────────────────────────────

const NUDGE_ICON_MAP: Record<string, any> = {
    therapist_directory: Brain,
    journey: Activity,
    breathing: Wind,
    affirmation: Sparkles,
    default: Heart,
};

// ── Audio category config (Icon + color) ───────────────────

const AUDIO_CATEGORIES = [
    { category: 'breathing',  Icon: Wind,      iconColor: colors.sapphire,  label: 'Guided Breathing'     },
    { category: 'meditation', Icon: Brain,      iconColor: colors.lavender,  label: 'Meditations'          },
    { category: 'sleep',      Icon: Moon,       iconColor: colors.emerald,   label: 'Sleep Sounds'         },
    { category: 'affirmation',Icon: Sun,        iconColor: colors.gold,      label: 'Morning Affirmations' },
];

// ── Main Component ─────────────────────────────────────────

export default function HomeScreen() {
    const [showSleepMode, setShowSleepMode] = useState(false);
    const { streak, todayDone, weeklyDays } = useStreak();
    const { data: adaptiveData } = useAdaptiveHome();
    const { data: youtubeData } = useYouTubeSearch('Pop', 'music');
    const { data: motivationData } = useYouTubeSearch('Pop', 'motivation');
    const { data: eventsData, isLoading: eventsLoading } = useEventSearch(40.7128, -74.006);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── Header ───────────────────────────────── */}
                <Animated.View entering={FadeIn.duration(350)} style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        {/* Date chip */}
                        <View style={styles.dateChip}>
                            <CalendarDays size={11} color={colors.gold} strokeWidth={2} />
                            <Text style={styles.dateChipText}>{getDateChip()}</Text>
                        </View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Animated.Text
                            entering={FadeInDown.delay(80).duration(450)}
                            style={styles.welcomeName}
                        >
                            Welcome to VinR
                        </Animated.Text>
                    </View>
                    <Animated.View entering={FadeIn.delay(150).duration(400)}>
                        <AvatarRing initials="VR" size={48} pulse style={{ marginTop: 6 }} />
                    </Animated.View>
                </Animated.View>

                {/* ── Daily Quote ────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(160).duration(420)} style={styles.quoteCard}>
                    <Quote size={14} color={colors.gold} strokeWidth={1.8} style={{ opacity: 0.7 }} />
                    <Text style={styles.quoteText}>{getDailyQuote()}</Text>
                </Animated.View>

                {/* ── Streak Hero ───────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(240).duration(480)}>
                    <GlassCard accent="gold" elevated shimmer glow>
                        <StreakHero
                            streak={streak}
                            todayDone={todayDone}
                            weeklyDays={weeklyDays}
                        />
                    </GlassCard>
                </Animated.View>

                {/* ── Adaptive Nudge Cards ──────────────────── */}
                {adaptiveData?.nudge_cards && adaptiveData.nudge_cards.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(320).duration(480)} style={styles.section}>
                        <SectionHeader title="For You" Icon={Sparkles} iconColor={colors.gold} delay={0} />
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
                                    delay={i * 60}
                                    onPress={() => {
                                        if (card.action === 'therapist_directory') router.push('/therapist');
                                        else if (card.action === 'journey') router.push('/(tabs)/journey');
                                    }}
                                />
                            );
                        })}
                    </Animated.View>
                )}

                {/* ── How are you feeling? ──────────────────── */}
                <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
                    <SectionHeader title="How Are You Feeling?" Icon={Heart} iconColor={colors.crimson} delay={0} />
                    <GoldButton label="Start a Check-In" onPress={() => router.push('/(tabs)/checkin')} />
                </Animated.View>

                {/* ── Today's Habit ─────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(480).duration(400)} style={styles.section}>
                    <SectionHeader title="Today's Habit" Icon={Activity} iconColor={colors.emerald} delay={0} />
                    <GlassCard noAnimation>
                        <View style={styles.habitRow}>
                            <View style={styles.habitIconWrap}>
                                <Brain size={22} color={colors.lavender} strokeWidth={1.8} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.habitTitle}>Mind Check-In</Text>
                                <Text style={styles.habitText}>
                                    Complete a check-in to unlock your personalized daily plan.
                                </Text>
                            </View>
                            <ChevronRight size={16} color={colors.textGhost} strokeWidth={1.5} />
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* ── Your Vibe — YouTube ───────────────────── */}
                {youtubeData && youtubeData.results.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(560).duration(400)} style={styles.section}>
                        <SectionHeader title="Your Vibe" Icon={Music2} iconColor={colors.sapphire} delay={0} />
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
                    </Animated.View>
                )}

                {/* ── Get Fired Up — Motivation ─────────────── */}
                {motivationData && motivationData.results.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(640).duration(400)} style={styles.section}>
                        <SectionHeader title="Get Fired Up" Icon={Zap} iconColor={colors.gold} delay={0} />
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
                    </Animated.View>
                )}

                {/* ── Tonight's Wind-down ───────────────────── */}
                <Animated.View entering={FadeInDown.delay(720).duration(400)} style={styles.section}>
                    <SectionHeader title="Tonight's Wind-Down" Icon={Headphones} iconColor={colors.lavender} delay={0} />
                    {AUDIO_CATEGORIES.map((cat) => (
                        <AudioCategoryCard
                            key={cat.category}
                            category={cat.category}
                            Icon={cat.Icon}
                            iconColor={cat.iconColor}
                            label={cat.label}
                        />
                    ))}
                </Animated.View>

                {/* ── Get Out & Connect ─────────────────────── */}
                <Animated.View entering={FadeInDown.delay(800).duration(400)} style={styles.section}>
                    <SectionHeader title="Get Out & Connect" Icon={Users} iconColor={colors.emerald} delay={0} />
                    <EventsList
                        events={eventsData?.events || []}
                        isLoading={eventsLoading}
                    />
                </Animated.View>

                {/* ── Sleep Mode ────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(880).duration(400)} style={styles.section}>
                    <GlassCard accent="sapphire" shimmer onPress={() => setShowSleepMode(true)}>
                        <View style={styles.sleepRow}>
                            <View style={styles.sleepIconWrap}>
                                <Moon size={24} color={colors.sapphire} strokeWidth={1.8} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sleepTitle}>Sleep Mode</Text>
                                <Text style={styles.sleepSubtitle}>Dim lights · breathing · auto-stop</Text>
                            </View>
                            <ChevronRight size={18} color={colors.textGhost} strokeWidth={1.5} />
                        </View>
                    </GlassCard>
                </Animated.View>

            </ScrollView>

            <SleepMode visible={showSleepMode} onClose={() => setShowSleepMode(false)} />
        </SafeAreaView>
    );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: 130,
    },
    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    headerLeft: { flex: 1 },
    dateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: `${colors.gold}10`,
        borderRadius: borderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: `${colors.gold}20`,
    },
    dateChipText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 10.5,
        color: colors.gold,
        letterSpacing: 0.3,
    },
    greeting: {
        fontFamily: fonts.bodyLight,
        fontSize: 12,
        color: colors.textGhost,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    welcomeName: {
        fontFamily: fonts.display,
        fontSize: 26,
        color: colors.textPrimary,
        marginTop: 3,
        lineHeight: 32,
    },
    // Quote
    quoteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: `${colors.gold}08`,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: `${colors.gold}15`,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
    },
    quoteText: {
        fontFamily: fonts.italic,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        flex: 1,
        fontStyle: 'italic',
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
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: `${colors.lavender}15`,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    habitTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    habitText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 18,
    },
    // Sleep
    sleepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sleepIconWrap: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: `${colors.sapphire}15`,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    sleepTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.textPrimary,
    },
    sleepSubtitle: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 1,
    },
});
