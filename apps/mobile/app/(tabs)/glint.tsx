import { useEffect, useCallback, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    Dimensions, Image, Pressable, ActivityIndicator,
    ViewToken, Modal, ScrollView, ViewStyle
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
    FadeInDown 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
    Flame, RefreshCw, Film, Music, 
    Settings, X, Check, Wind, Target, 
    Sparkles, Shield, Zap, Brain, Play 
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useGlint, Glint } from '../../hooks/useGlint';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { haptics } from '../../services/haptics';
import AmbientBackground from '../../components/ui/AmbientBackground';
import { SafeBlurView } from '../../components/ui/SafeBlurView';
import GlassCard from '../../components/ui/GlassCard';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = 480;
const TAB_BAR_HEIGHT = 90;

const GOALS = [
    { id: 'stress', label: 'Stress Relief', icon: Wind, color: '#FF7E5F' },
    { id: 'focus', label: 'Focus', icon: Target, color: '#4facfe' },
    { id: 'self_care', label: 'Self-Care', icon: Sparkles, color: '#f093fb' },
    { id: 'discipline', label: 'Discipline', icon: Shield, color: '#43e97b' },
    { id: 'productivity', label: 'Productivity', icon: Zap, color: '#fa71cd' },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain, color: '#00f2fe' },
];

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
        transform: scale(1.1);
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
          'onError': function(event) {
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

function GlintCard({ item, index, isActive, onError }: { item: Glint; index: number; isActive: boolean; onError: () => void }) {
    const { colors, isDark } = useTheme();
    const webViewRef = useRef<WebView>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Auto-play when active
    useEffect(() => {
        if (isActive) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
            setIsReady(false);
        }
    }, [isActive]);

    const togglePlayPause = () => {
        haptics.selection();
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);
        const action = newIsPlaying ? 'play' : 'pause';
        webViewRef.current?.injectJavaScript(`togglePlayPauseMsg('${action}'); true;`);
    };

    return (
        <Animated.View 
            entering={FadeInDown.delay(index * 150).springify()} 
            style={[styles.cardOuter, { marginBottom: 20 }]}
        >
            <GlassCard 
                style={styles.cardInner} 
                glow={isActive}
            >
                <Pressable style={styles.cardPressable} onPress={togglePlayPause}>
                    <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
                    
                    {isActive && (
                        <View style={[StyleSheet.absoluteFill, { zIndex: 1, opacity: isReady ? 1 : 0 }]}>
                            <WebView
                                ref={webViewRef}
                                source={{ html: generateHtml(item.video_id), baseUrl: 'https://localhost' }}
                                originWhitelist={['*']}
                                style={{ flex: 1, backgroundColor: 'transparent' }}
                                allowsInlineMediaPlayback={true}
                                mediaPlaybackRequiresUserAction={false}
                                javaScriptEnabled={true}
                                scrollEnabled={false}
                                onMessage={(event) => {
                                    try {
                                        const data = JSON.parse(event.nativeEvent.data);
                                        if (data.event === 'ready') setIsReady(true);
                                        if (data.event === 'error') onError();
                                    } catch (e) {}
                                }}
                            />
                        </View>
                    )}

                    {!isReady && (
                        <View style={[StyleSheet.absoluteFill, styles.loaderOverlay, { zIndex: 2 }]}>
                            {isActive ? (
                                <ActivityIndicator color={colors.gold} size="large" />
                            ) : (
                                <Play size={40} color="rgba(255,255,255,0.4)" fill="rgba(255,255,255,0.1)" />
                            )}
                        </View>
                    )}

                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                        style={styles.gradient}
                        pointerEvents="none"
                    />

                    <View style={styles.cardInfo} pointerEvents="none">
                        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                        <View style={styles.channelRow}>
                            <View style={[styles.channelBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                                <Text style={[styles.channelName, { color: colors.textPrimary }]}>{item.channel}</Text>
                            </View>
                            <View style={styles.audioRow}>
                                <Music size={12} color={colors.gold} />
                                <Text style={[styles.audioText, { color: colors.textMuted }]}>AI Curated</Text>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </GlassCard>
        </Animated.View>
    );
}

export default function GlintScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { glints, loading, error, fetchGlints } = useGlint();
    const { focusAreas, setFocusAreas } = useOnboardingStore();
    
    const [showSettings, setShowSettings] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayGlints, setDisplayGlints] = useState<Glint[]>([]);

    useEffect(() => {
        if (glints && glints.length > 0) {
            setDisplayGlints([...glints].sort(() => Math.random() - 0.5));
        } else {
            setDisplayGlints([]);
        }
    }, [glints]);

    useEffect(() => {
        const labels = GOALS.filter(g => focusAreas.includes(g.id)).map(g => g.label);
        fetchGlints(labels.length > 0 ? labels : ['Stress Relief']);
    }, []);

    const handleRefresh = useCallback(() => {
        haptics.light();
        const labels = GOALS.filter(g => focusAreas.includes(g.id)).map(g => g.label);
        fetchGlints(labels.length > 0 ? labels : ['Stress Relief']);
    }, [fetchGlints, focusAreas]);

    const toggleGoal = (id: string) => {
        haptics.selection();
        if (focusAreas.includes(id)) {
            setFocusAreas(focusAreas.filter(f => f !== id));
        } else {
            setFocusAreas([...focusAreas, id]);
        }
    };

    const handleVideoError = useCallback((videoId: string) => {
        setDisplayGlints((prev) => prev.filter(g => g.video_id !== videoId));
    }, []);

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

    const activeLabel = focusAreas.length > 0 
        ? GOALS.find(g => g.id === focusAreas[0])?.label + (focusAreas.length > 1 ? ` +${focusAreas.length - 1}` : '')
        : 'All Focus';

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground hideBlobs={true} />
            
            <SafeBlurView 
                intensity={isDark ? 85 : 35} 
                style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerLeft}>
                    <View style={[styles.backBtn, { backgroundColor: '#FFFFFF05', borderColor: colors.border }]}>
                        <Film size={20} color={colors.gold} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Glint Feed</Text>
                        <Text style={[styles.statusText, { color: colors.gold, marginTop: 2 }]}>{activeLabel}</Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <Pressable 
                        onPress={handleRefresh} 
                        style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', marginRight: 10 }]}
                    >
                        <RefreshCw size={20} color={colors.textPrimary} />
                    </Pressable>
                    <Pressable 
                        onPress={() => setShowSettings(true)} 
                        style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <Target size={20} color={colors.textPrimary} />
                    </Pressable>
                </View>
            </SafeBlurView>

            {loading && displayGlints.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.gold} />
                    <Text style={[styles.loadingText, { color: colors.gold }]}>Personalizing your feed...</Text>
                </View>
            ) : displayGlints.length > 0 ? (
                <FlatList
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
                    contentContainerStyle={{ 
                        paddingTop: 20,
                        paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 
                    }}
                    showsVerticalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    decelerationRate="normal"
                />
            ) : (
                <View style={styles.center}>
                    <Film size={48} color={colors.textGhost} strokeWidth={1} />
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Feed is empty</Text>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Try updating your focus areas in settings.</Text>
                    <Pressable onPress={handleRefresh} style={[styles.retryBtn, { backgroundColor: `${colors.gold}20` }]}>
                        <Text style={{ color: colors.gold, fontWeight: '700' }}>Refresh</Text>
                    </Pressable>
                </View>
            )}

            <Modal visible={showSettings} animationType="slide" transparent onRequestClose={() => setShowSettings(false)}>
                <View style={styles.modalBackdrop}>
                    <Pressable style={{ flex: 1 }} onPress={() => setShowSettings(false)} />
                    <View style={[
                        styles.bottomSheet, 
                        { 
                            backgroundColor: isDark ? colors.void : '#FFF',
                            paddingBottom: insets.bottom + 30 
                        }
                    ]}>
                        <View style={styles.sheetHandle} />
                        
                        <View style={styles.sheetHeader}>
                            <View>
                                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Perspective Tuning</Text>
                                <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>Toggle wellness perspectives for your feed</Text>
                            </View>
                        </View>

                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={styles.perspectiveScroll}
                        >
                            {GOALS.map((goal) => {
                                const isSelected = focusAreas.includes(goal.id);
                                const Icon = goal.icon;
                                return (
                                        <View key={goal.id} style={{ alignItems: 'center', marginRight: 16 } as ViewStyle}>
                                        <Pressable 
                                            onPress={() => toggleGoal(goal.id)}
                                            style={[
                                                styles.perspectiveTab,
                                                { 
                                                    backgroundColor: isSelected ? goal.color + '20' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                    borderColor: isSelected ? goal.color : 'transparent'
                                                }
                                            ]}
                                        >
                                            <Icon size={24} color={isSelected ? goal.color : colors.textMuted} />
                                        </Pressable>
                                        <Text style={[
                                            styles.perspectiveLabel, 
                                            { color: isSelected ? colors.textPrimary : colors.textMuted }
                                        ]}>
                                            {goal.label}
                                        </Text>
                                        {isSelected && <View style={[styles.activeDot, { backgroundColor: goal.color }]} />}
                                    </View>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.sheetFooter}>
                            <Pressable 
                                style={[styles.applyBtn, { backgroundColor: colors.gold }]}
                                onPress={() => {
                                    setShowSettings(false);
                                    handleRefresh();
                                }}
                            >
                                <Text style={[styles.applyBtnText, { color: colors.void }]}>Apply Perspective</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        zIndex: 100,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', fontFamily: fonts.display },
    statusText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardOuter: { width: SCREEN_W, paddingHorizontal: 16 },
    cardInner: { borderRadius: 24, overflow: 'hidden', height: CARD_HEIGHT },
    cardPressable: { flex: 1 },
    thumbnail: { ...StyleSheet.absoluteFillObject },
    loaderOverlay: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
    cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
    cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
    channelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    channelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    channelName: { fontSize: 11, fontWeight: '800' },
    audioRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    audioText: { fontSize: 11, fontWeight: '600' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { marginTop: 16, fontWeight: '700', fontSize: 13, letterSpacing: 1 },
    emptyTitle: { fontSize: 22, fontWeight: '800', marginTop: 24 },
    emptyText: { textAlign: 'center', marginTop: 10, opacity: 0.6, lineHeight: 20 },
    retryBtn: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25 },

    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    bottomSheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 20,
    },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 20 },
    sheetHeader: { marginBottom: 25 },
    sheetTitle: { fontSize: 22, fontWeight: '800', fontFamily: fonts.display },
    sheetSubtitle: { fontSize: 13, marginTop: 4 },
    perspectiveScroll: { paddingBottom: 10 },
    perspectiveTab: {
        width: 64,
        height: 64,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    perspectiveLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
    activeDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
    sheetFooter: { marginTop: 25 },
    applyBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    applyBtnText: { fontWeight: '800', letterSpacing: 1.5, fontSize: 14 },
});
