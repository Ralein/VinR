import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ActivityIndicator, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useReels, Reel } from '../hooks/useReels';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const REEL_HEIGHT = height - 80; // approximate height for bottom tab navigator

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  colors: any;
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isActive, colors }) => {
  // Using an image instead of an IFrame for now to conserve memory and handle playback natively via YouTube App or Browser
  // Later we can implement WebView if YouTube IFrame Player allows it inside the FlatList
  
  const handlePress = () => {
    const url = `https://www.youtube.com/shorts/${reel.video_id}`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={[styles.reelContainer, { backgroundColor: colors.background }]}>
      <Image 
        source={{ uri: reel.thumbnail_url }} 
        style={styles.thumbnail} 
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.playButton} onPress={handlePress}>
          <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{reel.title}</Text>
          <Text style={styles.channel}>{reel.channel}</Text>
        </View>
      </View>
    </View>
  );
};

export default function ReelsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { reels, loading, error, fetchReels } = useReels();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Determine user's primary reason or default to Stress Relief
    const reason = user?.primaryReason || 'Stress Relief';
    fetchReels(reason);
  }, [user]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (loading && reels.length === 0) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && reels.length === 0) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchReels(user?.primaryReason || 'Stress Relief')}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={reels}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} isActive={index === activeIndex} colors={colors} />
        )}
        keyExtractor={(item) => item.video_id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapping={true}
        snapToInterval={REEL_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: REEL_HEIGHT,
          offset: REEL_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelContainer: {
    width: width,
    height: REEL_HEIGHT,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  channel: {
    color: '#E0E0E0',
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
  },
});
