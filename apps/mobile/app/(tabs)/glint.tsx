/**
 * Glint Tab — Vertical short-form video feed (Instagram Reels-style)
 *
 * Shows YouTube Shorts thumbnails in a full-screen vertical scroll.
 * Tap a card → opens in YouTube app (avoids broken WebView embeds).
 * Uses FlatList with snap-to-item for smooth page-by-page scrolling.
 */

import { useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, Pressable,
    Dimensions, Image, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ExternalLink, Flame, RefreshCw, Film } from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useGlint, Glint } from '../../hooks/useGlint';
import { haptics } from '../../services/haptics';
import AmbientBackground from '../../components/ui/AmbientBackground';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_H * 0.72;

// ── Single Glint Card ──────────────────────────────────────────

function GlintCard({ item, index }: { item: Glint; index: number }) {
    const { colors } = useTheme();

    const openInYouTube = useCallback(() => {
        haptics.light();
        // Try YouTube Shorts URL first (opens in YouTube app as a Short)
        const shortsUrl = `https://www.youtube.com/shorts/${item.video_id}`;
        Linking.openURL(shortsUrl).catch(() => {
            // Fallback to standard watch URL
            Linking.openURL(`https://www.youtube.com/watch?v=${item.video_id}`);
        });
    }, [item.video_id]);

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={styles.cardOuter}
        >
            <Pressable onPress={openInYouTube} style={styles.cardPressable}>
                {/* Thumbnail */}
                <Image
                    source={{ uri: item.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                {/* Gradient overlay for text readability */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.75)']}
                    locations={[0, 0.5, 1]}
                    style={styles.gradient}
                />

                {/* Play button overlay */}
                <View style={styles.playOverlay}>
                    <Animated.View
                        entering={ZoomIn.delay(200 + index * 100).duration(300)}
                        style={[styles.playButton, { backgroundColor: `${colors.gold}DD` }]}
                    >
                        <Play
                            size={32}
                            color="#FFFFFF"
                            fill="#FFFFFF"
                            strokeWidth={0}
                        />
                    </Animated.View>
                </View>

                {/* Video info at bottom */}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.channelRow}>
                        <Text style={styles.channelName}>{item.channel}</Text>
                        <View style={styles.watchBadge}>
                            <ExternalLink size={11} color="#FFFFFF" strokeWidth={2.2} />
                            <Text style={styles.watchText}>Watch</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}

// ── Main Screen ────────────────────────────────────────────────

export default function GlintScreen() {
    const { colors } = useTheme();
    const { glints, loading, error, fetchGlints } = useGlint();
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchGlints();
    }, [fetchGlints]);

    const handleRefresh = useCallback(() => {
        haptics.light();
        fetchGlints();
    }, [fetchGlints]);

    // ── Empty state ──
    if (!loading && glints.length === 0 && !error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
                <AmbientBackground />
                <View style={styles.emptyState}>
                    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyInner}>
                        <View style={[styles.emptyIcon, { backgroundColor: `${colors.gold}12` }]}>
                            <Film size={44} color={colors.gold} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                            No Glints Yet
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            Short-form wellness videos will appear here once configured.
                        </Text>
                        <Pressable
                            onPress={handleRefresh}
                            style={[styles.retryButton, { backgroundColor: `${colors.gold}15`, borderColor: `${colors.gold}30` }]}
                        >
                            <RefreshCw size={16} color={colors.gold} strokeWidth={2} />
                            <Text style={[styles.retryText, { color: colors.gold }]}>Try again</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            <AmbientBackground />
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.header}>
                <View style={styles.headerLeft}>
                    <Flame size={20} color={colors.gold} strokeWidth={2} fill={`${colors.gold}40`} />
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Glint</Text>
                </View>
                <Pressable onPress={handleRefresh} hitSlop={12}>
                    <RefreshCw size={18} color={colors.textGhost} strokeWidth={1.8} />
                </Pressable>
            </Animated.View>

            {/* Loading */}
            {loading && (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.gold} />
                </View>
            )}

            {/* Error */}
            {error && (
                <View style={styles.errorWrap}>
                    <Text style={[styles.errorText, { color: colors.crimson }]}>{error}</Text>
                    <Pressable onPress={handleRefresh} style={[styles.retryButton, { backgroundColor: `${colors.crimson}12`, borderColor: `${colors.crimson}30` }]}>
                        <RefreshCw size={14} color={colors.crimson} strokeWidth={2} />
                        <Text style={[styles.retryText, { color: colors.crimson }]}>Retry</Text>
                    </Pressable>
                </View>
            )}

            {/* Video Feed */}
            {!loading && glints.length > 0 && (
                <FlatList
                    ref={flatListRef}
                    data={glints}
                    keyExtractor={(item) => item.video_id}
                    renderItem={({ item, index }) => <GlintCard item={item} index={index} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={CARD_HEIGHT + 16}
                    decelerationRate="fast"
                    snapToAlignment="start"
                />
            )}
        </SafeAreaView>
    );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontFamily: fonts.display,
        fontSize: 26,
        letterSpacing: -0.3,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    // Card
    cardOuter: {
        height: CARD_HEIGHT,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: 16,
    },
    cardPressable: {
        flex: 1,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius.lg,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        borderBottomLeftRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.lg,
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 4, // Optical centering for play icon
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    cardInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 18,
    },
    cardTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: '#FFFFFF',
        lineHeight: 22,
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    channelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    channelName: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        flex: 1,
    },
    watchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    watchText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    // Empty state
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyInner: {
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontFamily: fonts.display,
        fontSize: 24,
        marginBottom: 10,
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
    },
    retryText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
    },
    // Loading / Error
    loadingWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    errorText: {
        fontFamily: fonts.body,
        fontSize: 14,
        textAlign: 'center',
    },
});
