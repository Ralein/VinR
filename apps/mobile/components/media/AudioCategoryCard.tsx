/**
 * AudioCategoryCard v2 — Icon-based header (no emoji)
 *
 * Accepts an Icon (Lucide) component instead of an emoji string.
 * Track items: Play icon + music note accent. Loading/empty states polished.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Play, Music, Radio } from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useAudioLibrary, usePlayTrack, type AudioTrack } from '../../hooks/useMedia';

interface AudioCategoryCardProps {
    category: string;
    /** Lucide icon component */
    Icon?: any;
    /** Accent color for the icon circle */
    iconColor?: string;
    label: string;
    /** @deprecated — pass Icon instead */
    emoji?: string;
}

function TrackItem({ track, onPlay }: { track: AudioTrack; onPlay: (t: AudioTrack) => void }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { stiffness: 300, damping: 20 }) }],
    }));

    return (
        <Pressable
            onPressIn={() => { scale.value = 0.97; }}
            onPressOut={() => { scale.value = 1; }}
            onPress={() => onPlay(track)}
        >
            <Animated.View style={[styles.trackItem, animStyle]}>
                <View style={styles.trackIconWrap}>
                    <Music size={14} color={colors.textMuted} strokeWidth={1.8} />
                </View>
                <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.trackDuration}>{track.duration_label}</Text>
                </View>
                <View style={styles.playBtn}>
                    <Play size={12} color={colors.gold} strokeWidth={2} fill={colors.gold} />
                </View>
            </Animated.View>
        </Pressable>
    );
}

export default function AudioCategoryCard({
    category, Icon, iconColor, label,
}: AudioCategoryCardProps) {
    const { data, isLoading } = useAudioLibrary(category);
    const playTrack = usePlayTrack();
    const accentColor = iconColor ?? colors.gold;
    const IconComp = Icon ?? Radio;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconCircle, { backgroundColor: `${accentColor}15` }]}>
                    <IconComp size={18} color={accentColor} strokeWidth={1.8} />
                </View>
                <Text style={styles.headerLabel}>{label}</Text>
            </View>

            {isLoading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : data?.tracks && data.tracks.length > 0 ? (
                <View>
                    {data.tracks.map((track) => (
                        <TrackItem key={track.id} track={track} onPlay={playTrack} />
                    ))}
                </View>
            ) : (
                <Text style={styles.emptyText}>No tracks available</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    iconCircle: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    headerLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.textPrimary,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.sm,
    },
    trackIconWrap: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: colors.elevated,
        alignItems: 'center', justifyContent: 'center',
    },
    trackInfo: { flex: 1 },
    trackTitle: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textPrimary,
    },
    trackDuration: {
        fontFamily: fonts.body,
        fontSize: 11,
        color: colors.textGhost,
        marginTop: 1,
    },
    playBtn: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: `${colors.gold}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    loadingText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textGhost,
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textGhost,
        fontStyle: 'italic',
    },
});
