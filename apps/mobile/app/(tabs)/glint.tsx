/**
 * Glint Tab — Vertical short-form video feed (Instagram Reels-style)
 *
 * Shows YouTube Shorts automatically playing in a full-screen vertical scroll.
 * Uses FlatList with snap-to-item for smooth page-by-page scrolling.
 * Videos are filtered based on the user's primary reason from onboarding.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    Dimensions, Image, Pressable, ActivityIndicator,
    ViewToken
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, RefreshCw, Film, Music, Play, Pause } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useGlint, Glint } from '../../hooks/useGlint';
import { useAuthStore } from '../../stores/authStore';
import { haptics } from '../../services/haptics';
import AmbientBackground from '../../components/ui/AmbientBackground';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_H * 0.72;

// Auto-playing HTML Wrapper for YouTube IFrames
const generateHtml = (videoId: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: transparent; overflow: hidden; }
    iframe {
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        border: none;
        transform: scale(1.05); /* Slight scale to hide video edges and YouTube logo bleeding */
        transform-origin: center center;
    }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '${videoId}',
        playerVars: {
          'playsinline': 1,
          'autoplay': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'rel': 0,
          'modestbranding': 1,
          'loop': 1,
          'cc_load_policy': 0,
          'iv_load_policy': 3,
          'playlist': '${videoId}',
          'origin': 'https://localhost',
          'widget_referrer': 'https://localhost'
        },
        events: {
          'onReady': function(event) {
             event.target.playVideo();
             window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ready' }));
          },
          'onStateChange': function(event) {
             // We removed the forced playVideo() on PAUSED here so it *can* be paused
          },
          'onError': function(event) {
             // 100/101/150 means video unavailable or embedding not allowed
             window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'error', code: event.data }));
          }
        }
      });
    }

    function togglePlayPauseMsg(action) {
        if (player && typeof player.playVideo === 'function') {
            if (action === 'play') {
                player.playVideo();
            } else if (action === 'pause') {
                player.pauseVideo();
            }
        }
    }
  </script>
</body>
</html>
`;

// ── Single Glint Card ──────────────────────────────────────────

function GlintCard({ item, index, isActive, onError }: { item: Glint; index: number; isActive: boolean; onError: () => void }) {
    const { colors } = useTheme();
    const webViewRef = useRef<WebView>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    
    // Transient play/pause icon state
    const [actionIcon, setActionIcon] = useState<'play' | 'pause' | null>(null);
    const [actionTrigger, setActionTrigger] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset readiness if it becomes active again just in case
    useEffect(() => {
        if (!isActive) {
            setIsReady(false);
            setIsPlaying(true);
            setActionIcon(null);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    }, [isActive]);

    const togglePlayPause = () => {
        if (!isActive || !isReady) return;
        haptics.selection();
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);
        
        const action = newIsPlaying ? 'play' : 'pause';
        webViewRef.current?.injectJavaScript(`togglePlayPauseMsg('${action}'); true;`);

        // Trigger brief visual overlay
        setActionIcon(action);
        setActionTrigger(prev => prev + 1);
        
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setActionIcon(null);
        }, 800); // Overlay disappears after 800ms
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={styles.cardOuter}
        >
            <Pressable style={styles.cardInner} onPress={togglePlayPause}>
                {/* Thumbnail Layer (Visible while loading or inactive) */}
                <Image
                    source={{ uri: item.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                {/* Video Layer (Only enabled when active) */}
                {isActive && (
                    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 1, opacity: isReady ? 1 : 0 }]} pointerEvents="none">
                        <WebView
                            ref={webViewRef}
                            source={{ html: generateHtml(item.video_id), baseUrl: 'https://localhost' }}
                            originWhitelist={['*']}
                            style={{ flex: 1, backgroundColor: 'transparent' }}
                            allowsInlineMediaPlayback={true}
                            mediaPlaybackRequiresUserAction={false}
                            javaScriptEnabled={true}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            onMessage={(event) => {
                                try {
                                    const data = JSON.parse(event.nativeEvent.data);
                                    if (data.event === 'ready') setIsReady(true);
                                    if (data.event === 'error') onError();
                                } catch (e) {}
                            }}
                        />
                    </Animated.View>
                )}

                {/* Loading Indicator */}
                {isActive && !isReady && (
                    <View style={[StyleSheet.absoluteFill, styles.loaderOverlay, { zIndex: 2 }]} pointerEvents="none">
                        <ActivityIndicator color={colors.gold} size="large" />
                    </View>
                )}

                {/* Gradient overlay for UI readability */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
                    locations={[0, 0.5, 1]}
                    style={[styles.gradient, { zIndex: 3 }]}
                    pointerEvents="none"
                />

                {/* Transient Pause/Play Visual Indicator */}
                {actionIcon && (
                    <Animated.View 
                        key={`${actionIcon}-${actionTrigger}`}
                        entering={ZoomIn.duration(200)}
                        exiting={ZoomOut.duration(200)}
                        style={[StyleSheet.absoluteFill, styles.pauseOverlay]} 
                        pointerEvents="none"
                    >
                        <View style={styles.playIconContainer}>
                            {actionIcon === 'play' ? (
                                <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
                            ) : (
                                <Pause size={40} color="#FFFFFF" fill="#FFFFFF" />
                            )}
                        </View>
                    </Animated.View>
                )}

                {/* Bottom Video Info */}
                <View style={[styles.cardInfo, { zIndex: 4 }]} pointerEvents="none">
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.channelRow}>
                        <View style={styles.channelBadge}>
                            <Text style={styles.channelName}>{item.channel}</Text>
                        </View>
                        <View style={styles.audioRow}>
                            <Music size={12} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.audioText}>Original Audio</Text>
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
    const insets = useSafeAreaInsets();
    const { glints, loading, error, fetchGlints } = useGlint();
    const { user } = useAuthStore();
    
    // Default fallback to 'Stress Relief', but fetches personalized content based on user onboarding
    const primaryReason = user?.primaryReason || 'Stress Relief';

    const flatListRef = useRef<FlatList>(null);
    const [displayGlints, setDisplayGlints] = useState<Glint[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Shuffle and set data when fetching finishes
    useEffect(() => {
        if (glints && glints.length > 0) {
            const shuffled = [...glints];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setDisplayGlints(shuffled);
        } else {
            setDisplayGlints([]);
        }
    }, [glints]);

    useEffect(() => {
        fetchGlints(primaryReason);
    }, [fetchGlints, primaryReason]);

    const handleRefresh = useCallback(() => {
        haptics.light();
        fetchGlints(primaryReason);
    }, [fetchGlints, primaryReason]);

    const handleVideoError = useCallback((videoId: string) => {
        setDisplayGlints((prev) => prev.filter(g => g.video_id !== videoId));
    }, []);

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

    // ── Empty state ──
    if (!loading && displayGlints.length === 0 && !error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
                <AmbientBackground hideBlobs={true} />
                <View style={styles.emptyState}>
                    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyInner}>
                        <View style={[styles.emptyIcon, { backgroundColor: `${colors.gold}12` }]}>
                            <Film size={44} color={colors.gold} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                            No Glints Found
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            We're preparing personalized {primaryReason.toLowerCase()} shorts for you. Check back soon.
                        </Text>
                        <Pressable
                            onPress={handleRefresh}
                            style={[styles.retryButton, { backgroundColor: `${colors.gold}15`, borderColor: `${colors.gold}30` }]}
                        >
                            <RefreshCw size={16} color={colors.gold} strokeWidth={2} />
                            <Text style={[styles.retryText, { color: colors.gold }]}>Refresh Feed</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]} edges={['top']}>
            <AmbientBackground hideBlobs={true} />
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={[styles.header, { paddingBottom: 16 }]}>
                <View style={styles.headerLeft}>
                    <Flame size={24} color={colors.gold} strokeWidth={2} fill={`${colors.gold}40`} />
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Glint</Text>
                    <View style={[styles.topicBadge, { backgroundColor: `${colors.gold}20` }]}>
                        <Text style={[styles.topicText, { color: colors.gold }]}>{primaryReason}</Text>
                    </View>
                </View>
                <Pressable onPress={handleRefresh} hitSlop={12}>
                    <RefreshCw size={20} color={colors.textGhost} strokeWidth={1.8} />
                </Pressable>
            </Animated.View>

            {/* Loading */}
            {loading && displayGlints.length === 0 && (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.gold} />
                    <Text style={[styles.loadingText, { color: colors.gold }]}>Curating your feed...</Text>
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
            {displayGlints.length > 0 && (
                <FlatList
                    ref={flatListRef}
                    data={displayGlints}
                    keyExtractor={(item, index) => `${item.video_id}_${index}`}
                    renderItem={({ item, index }) => (
                        <GlintCard 
                            item={item} 
                            index={index} 
                            isActive={index === currentIndex} 
                            onError={() => handleVideoError(item.video_id)} 
                        />
                    )}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={CARD_HEIGHT + 24} // card height + marginBottom
                    decelerationRate="fast"
                    snapToAlignment="start"
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
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
        paddingTop: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontFamily: fonts.display,
        fontSize: 28,
        letterSpacing: -0.5,
    },
    topicBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 4,
    },
    topicText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 11,
        letterSpacing: 0.3,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: 8,
    },
    // Card
    cardOuter: {
        height: CARD_HEIGHT,
        marginBottom: 24,
        borderRadius: borderRadius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    cardInner: {
        flex: 1,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    loaderOverlay: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    pauseOverlay: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    playIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
    },
    // Bottom Info
    cardInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 24,
    },
    cardTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: '#FFFFFF',
        lineHeight: 24,
        marginBottom: 12,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    channelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    channelBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    channelName: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
    audioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    audioText: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    // Empty / Error / Loading States
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
        marginBottom: 24,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
    },
    retryText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
    },
    loadingWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
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
