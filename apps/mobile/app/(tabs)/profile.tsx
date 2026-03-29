/**
 * Profile → "My Journey" Analytics Dashboard
 *
 * - Mood trend line chart (gold line, emerald streak dots)
 * - Emotion distribution donut chart
 * - AI insight cards
 * - Total stats row
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    MessageSquare, CalendarDays, Flame, BookText,
    BarChart2, TrendingUp, Settings
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fonts, spacing, glass, borderRadius } from '../../constants/theme';
import { useTheme, type ThemeColors } from '../../context/ThemeContext';
import {
    useAnalyticsSummary,
    useAnalyticsTrends,
    MoodTrendPoint,
    EmotionSlice,
    InsightCard,
} from '../../hooks/useAnalytics';
import AmbientBackground from '../../components/ui/AmbientBackground';
import GlassCard from '../../components/ui/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;

// Emotion color mapping for donut
const EMOTION_COLORS: Record<string, string> = {
    happy: '#F0C96B',
    grateful: '#D4A853',
    calm: '#4ECBA0',
    hopeful: '#4A90D9',
    okay: '#7A8099',
    neutral: '#7A8099',
    anxious: '#E8A85D',
    stressed: '#E8875D',
    lonely: '#9B59B6',
    sad: '#5D8CE8',
    angry: '#E85D5D',
    overwhelmed: '#E85D75',
};

// ──────────────────────────── Mini Line Chart ────────────────────────────

function MoodLineChart({ trends }: { trends: MoodTrendPoint[] }) {
    const { colors } = useTheme();

    if (trends.length < 2) {
        return (
            <View style={chartStyles.empty}>
                <Text style={[chartStyles.emptyText, { color: colors.textMuted }]}>
                    Check in a few more times to see your mood trend
                </Text>
            </View>
        );
    }

    const maxScore = 5;
    const minScore = 1;
    const range = maxScore - minScore;
    const padding = 8;
    const usableWidth = CHART_WIDTH - padding * 2;
    const usableHeight = CHART_HEIGHT - padding * 2 - 20;

    const points = trends.map((t, i) => ({
        x: padding + (i / (trends.length - 1)) * usableWidth,
        y: padding + 10 + usableHeight - ((t.mood_score - minScore) / range) * usableHeight,
        isStreak: t.is_streak_day,
        score: t.mood_score,
    }));

    return (
        <View style={[chartStyles.container, { height: CHART_HEIGHT }]}>
            {[5, 4, 3, 2, 1].map((val) => {
                const y = padding + 10 + usableHeight - ((val - minScore) / range) * usableHeight;
                return (
                    <View key={val} style={[chartStyles.gridLine, { top: y }]}>
                        <Text style={[chartStyles.yLabel, { color: colors.textGhost }]}>{val}</Text>
                        <View style={[chartStyles.gridDash, { backgroundColor: colors.border }]} />
                    </View>
                );
            })}

            {points.slice(0, -1).map((p, i) => {
                const next = points[i + 1];
                const dx = next.x - p.x;
                const dy = next.y - p.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                    <View
                        key={`line-${i}`}
                        style={[
                            chartStyles.lineSegment,
                            {
                                left: p.x,
                                top: p.y,
                                width: length,
                                backgroundColor: colors.gold,
                                transform: [{ rotate: `${angle}deg` }],
                                transformOrigin: 'left center',
                            },
                        ]}
                    />
                );
            })}

            {points.map((p, i) => (
                <View
                    key={`dot-${i}`}
                    style={[
                        chartStyles.dot,
                        {
                            left: p.x - 4,
                            top: p.y - 4,
                            backgroundColor: p.isStreak ? colors.emerald : colors.gold,
                            borderColor: colors.surface,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// ──────────────────────────── Donut Chart ────────────────────────────

function EmotionDonut({ distribution }: { distribution: EmotionSlice[] }) {
    const { colors } = useTheme();

    if (distribution.length === 0) {
        return (
            <View style={donutStyles.empty}>
                <Text style={[chartStyles.emptyText, { color: colors.textMuted }]}>No emotion data yet</Text>
            </View>
        );
    }

    return (
        <View style={donutStyles.container}>
            <View style={donutStyles.bars}>
                {distribution.map((slice) => (
                    <View key={slice.emotion} style={donutStyles.barRow}>
                        <View style={donutStyles.labelRow}>
                            <View
                                style={[
                                    donutStyles.colorDot,
                                    { backgroundColor: EMOTION_COLORS[slice.emotion] || colors.textMuted },
                                ]}
                            />
                            <Text style={[donutStyles.label, { color: colors.textPrimary }]}>{slice.emotion}</Text>
                            <Text style={[donutStyles.pct, { color: colors.textMuted }]}>{slice.percentage}%</Text>
                        </View>
                        <View style={[donutStyles.barBg, { backgroundColor: colors.elevated }]}>
                            <View
                                style={[
                                    donutStyles.barFill,
                                    {
                                        width: `${slice.percentage}%`,
                                        backgroundColor: EMOTION_COLORS[slice.emotion] || colors.gold,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ──────────────────────────── Stat Card ────────────────────────────

function StatCard({ value, label, Icon, color }: { value: number; label: string; Icon: any; color: string }) {
    const { colors } = useTheme();
    return (
        <View style={statStyles.cardWrapper}>
            <GlassCard noAnimation accent="gold" style={[{ padding: spacing.md }, statStyles.cardInner]}>
                <View style={[statStyles.iconWrap, { backgroundColor: `${color}15` }]}>
                    <Icon size={18} color={color} strokeWidth={1.8} />
                </View>
                <Text style={[statStyles.value, { color: colors.textPrimary }]}>{value}</Text>
                <Text style={[statStyles.label, { color: colors.textMuted }]}>{label}</Text>
            </GlassCard>
        </View>
    );
}

// ──────────────────────────── Insight Card ────────────────────────────

function InsightCardView({ insight }: { insight: InsightCard }) {
    const { colors } = useTheme();
    return (
        <View style={{ marginBottom: spacing.sm }}>
            <GlassCard glow shimmer accent="gold" style={{ padding: spacing.md }}>
                <View style={insightStyles.contentRow}>
                    <View style={[insightStyles.iconWrap, { backgroundColor: `${colors.gold}15` }]}>
                        <TrendingUp size={18} color={colors.gold} strokeWidth={2} />
                    </View>
                    <Text style={[insightStyles.text, { color: colors.textPrimary }]}>{insight.text}</Text>
                </View>
            </GlassCard>
        </View>
    );
}

// ──────────────────────────── Main Screen ────────────────────────────

export default function ProfileScreen() {
    const { colors } = useTheme();
    const [period, setPeriod] = useState('30d');
    const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
    const { data: trends, isLoading: loadingTrends } = useAnalyticsTrends(period);
    const router = useRouter();

    const isLoading = loadingSummary || loadingTrends;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground />
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.avatarCircle, { backgroundColor: `${colors.gold}10`, borderColor: colors.gold }]}>
                        <Flame size={32} color={colors.gold} strokeWidth={1.5} fill={`${colors.gold}25`} />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>My Journey</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your wellness analytics</Text>
                    <Pressable
                        style={styles.settingsButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Settings size={26} color={colors.textMuted} />
                    </Pressable>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading your journey...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Row */}
                        {summary && (
                            <View style={styles.statsRow}>
                                <StatCard value={summary.total_checkins}     label="Check-ins"  Icon={MessageSquare} color={colors.gold} />
                                <StatCard value={summary.total_days_completed} label="Days"      Icon={CalendarDays}  color={colors.emerald} />
                                <StatCard value={summary.best_streak}        label="Best Streak" Icon={Flame}         color='#E84545' />
                                <StatCard value={summary.journal_entries}    label="Journals"   Icon={BookText}      color={colors.sapphire} />
                            </View>
                        )}

                        {/* Period Selector */}
                        <View style={styles.periodRow}>
                            {['7d', '14d', '30d'].map((p) => (
                                <Pressable
                                    key={p}
                                    style={[
                                        styles.periodChip,
                                        { backgroundColor: colors.surface, borderColor: colors.border },
                                        period === p && { backgroundColor: colors.goldGlow, borderColor: colors.gold },
                                    ]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            { color: colors.textMuted },
                                            period === p && { color: colors.gold },
                                        ]}
                                    >
                                        {p.replace('d', ' days')}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Mood Trend Chart */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mood Trend</Text>
                            <GlassCard style={styles.chartCardWrapper}>
                                <MoodLineChart trends={trends?.mood_trends || []} />
                                <View style={styles.legendRow}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
                                        <Text style={[styles.legendText, { color: colors.textMuted }]}>Mood</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.emerald }]} />
                                        <Text style={[styles.legendText, { color: colors.textMuted }]}>Streak day</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </View>

                        {/* Emotion Distribution */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Emotional Dashboard</Text>
                            <GlassCard style={styles.chartCardWrapper}>
                                <EmotionDonut distribution={trends?.emotion_distribution || []} />
                            </GlassCard>
                        </View>

                        {/* Streak Correlation */}
                        {trends?.streak_correlation && trends.streak_correlation.improvement_percent > 0 && (
                            <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.lg }}>
                                <GlassCard accent="emerald" glow style={{ padding: spacing.md }}>
                                    <View style={styles.correlationRow}>
                                        <View style={[styles.correlationIconWrap, { backgroundColor: `${colors.emerald}15` }]}>
                                            <BarChart2 size={22} color={colors.emerald} strokeWidth={1.8} />
                                        </View>
                                        <Text style={[styles.correlationText, { color: colors.textPrimary }]}>
                                            You feel{' '}
                                            <Text style={[styles.correlationHighlight, { color: colors.emerald }]}>
                                                {trends.streak_correlation.improvement_percent}% better
                                            </Text>{' '}
                                            on days you complete your habit.
                                        </Text>
                                    </View>
                                </GlassCard>
                            </View>
                        )}

                        {/* AI Insights */}
                        {trends?.insights && trends.insights.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Insights</Text>
                                {trends.insights.map((insight, i) => (
                                    <InsightCardView key={i} insight={insight} />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ──────────────────────────── Styles ────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    header: {
        alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg,
    },
    avatarCircle: {
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 2,
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
    },
    title: {
        fontFamily: fonts.display, fontSize: 28,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 14,
    },
    settingsButton: {
        position: 'absolute',
        top: spacing.xl,
        right: spacing.lg,
        padding: spacing.xs,
    },
    loadingContainer: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        fontFamily: fonts.body, fontSize: 14,
        marginTop: spacing.md,
    },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    periodRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: spacing.sm, marginBottom: spacing.lg,
    },
    periodChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    periodText: {
        fontFamily: fonts.bodySemiBold, fontSize: 13,
    },
    section: {
        paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: fonts.display, fontSize: 20,
        marginBottom: spacing.md,
    },
    chartCardWrapper: {
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: 0,
    },
    legendRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: spacing.lg, marginTop: spacing.sm,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: {
        fontFamily: fonts.body, fontSize: 12,
    },
    correlationRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: spacing.sm,
    },
    correlationIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    correlationText: {
        fontFamily: fonts.body, fontSize: 14,
        flex: 1,
    },
    correlationHighlight: {
        fontFamily: fonts.bodySemiBold,
    },
});

const chartStyles = StyleSheet.create({
    container: {
        width: CHART_WIDTH, position: 'relative',
    },
    empty: {
        height: CHART_HEIGHT, justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: fonts.body, fontSize: 14,
        textAlign: 'center',
    },
    gridLine: {
        position: 'absolute', left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center',
    },
    yLabel: {
        fontFamily: fonts.mono, fontSize: 10,
        width: 16, textAlign: 'right',
        marginRight: 4,
    },
    gridDash: {
        flex: 1, height: 1,
    },
    lineSegment: {
        position: 'absolute', height: 2,
        borderRadius: 1,
    },
    dot: {
        position: 'absolute', width: 8, height: 8,
        borderRadius: 4, borderWidth: 2,
    },
});

const donutStyles = StyleSheet.create({
    container: { paddingVertical: spacing.sm },
    empty: {
        height: 100, justifyContent: 'center', alignItems: 'center',
    },
    bars: { gap: spacing.sm },
    barRow: { gap: 4 },
    labelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    colorDot: { width: 10, height: 10, borderRadius: 5 },
    label: {
        fontFamily: fonts.bodySemiBold, fontSize: 13,
        flex: 1, textTransform: 'capitalize',
    },
    pct: {
        fontFamily: fonts.mono, fontSize: 12,
    },
    barBg: {
        height: 6,
        borderRadius: 3, overflow: 'hidden',
    },
    barFill: { height: 6, borderRadius: 3 },
});

const statStyles = StyleSheet.create({
    cardWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    cardInner: {
        alignItems: 'center',
    },
    iconWrap: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 6,
    },
    value: {
        fontFamily: fonts.mono, fontSize: 20,
    },
    label: {
        fontFamily: fonts.body, fontSize: 10,
        marginTop: 2, textAlign: 'center',
    },
});

const insightStyles = StyleSheet.create({
    contentRow: {
        flexDirection: 'row', alignItems: 'flex-start',
        gap: spacing.sm,
    },
    iconWrap: {
        width: 34, height: 34, borderRadius: 17,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    text: {
        fontFamily: fonts.body, fontSize: 14,
        flex: 1,
        lineHeight: 20, paddingTop: 7,
    },
});
