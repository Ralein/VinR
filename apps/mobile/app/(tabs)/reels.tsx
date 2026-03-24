/**
 * Reels Tab — Vertical wellness video feed
 *
 * Full-screen thumbnail cards with paging, matched to user's
 * primary wellness reason. Taps open YouTube Shorts in browser.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  ActivityIndicator, TouchableOpacity, Linking, Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Play, Film, RefreshCw } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useReels, Reel } from '../../hooks/useReels';

const { width, height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 84;
const REEL_HEIGHT = height - TAB_BAR_HEIGHT;

// ──────────────────── Reel Card ────────────────────

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  index: number;
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isActive, index }) => {
  const handlePress = () => {
    const url = `https://www.youtube.com/shorts/${reel.video_id}`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.reelContainer}>
      <Image
        source={{ uri: reel.thumbnail_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      {/* Play button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.playCircle}>
          <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Info overlay */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{reel.title}</Text>
        <Text style={styles.channel}>{reel.channel}</Text>
      </View>
    </View>
  );
};

// ──────────────────── Screen ────────────────────

export default function ReelsScreen() {
  const user = useAuthStore((s) => s.user);
  const { reels, loading, error, fetchReels } = useReels();
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const reason = user?.primaryReason || 'Stress Relief';

  useEffect(() => {
    fetchReels(reason);
  }, [reason]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReels(reason);
    setRefreshing(false);
  }, [reason]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // ── Loading ──
  if (loading && reels.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Animated.View entering={FadeIn.duration(300)}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading reels…</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error && reels.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.errorBox}>
          <Film size={48} color={colors.textGhost} />
          <Text style={styles.errorTitle}>Couldn't load reels</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchReels(reason)}
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color={colors.void} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Empty state ──
  if (!loading && reels.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Film size={48} color={colors.textGhost} />
        <Text style={styles.errorTitle}>No reels available</Text>
        <Text style={styles.errorSubtitle}>Check back later for new content</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <Film size={18} color={colors.gold} />
          <Text style={styles.headerTitle}>Reels</Text>
        </Animated.View>
      </SafeAreaView>

      <FlatList
        data={reels}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} isActive={index === activeIndex} index={index} />
        )}
        keyExtractor={(item) => item.video_id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={REEL_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_data, index) => ({
          length: REEL_HEIGHT,
          offset: REEL_HEIGHT * index,
          index,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
          />
        }
      />
    </View>
  );
}

// ──────────────────── Styles ────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.void,
    gap: 12,
  },

  // Header
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },

  // Reel item
  reelContainer: {
    width,
    height: REEL_HEIGHT,
    backgroundColor: colors.void,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    // Approximate top gradient via shadow
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  // Play
  playButton: {
    position: 'absolute',
    zIndex: 5,
  },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.gold}44`,
    borderWidth: 2,
    borderColor: `${colors.gold}88`,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },

  // Info
  infoContainer: {
    position: 'absolute',
    bottom: 24,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.display,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  channel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },

  // Loading / Error
  loadingText: {
    color: colors.textGhost,
    fontFamily: fonts.body,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  errorBox: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 18,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: colors.textGhost,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
    marginTop: 8,
  },
  retryText: {
    color: colors.void,
    fontFamily: fonts.display,
    fontSize: 15,
  },
});
