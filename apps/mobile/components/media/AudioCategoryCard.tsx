/**
 * AudioCategoryCard — Card for an audio category (Sleep, Breathing, etc.)
 */

import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useAudioLibrary, usePlayTrack, type AudioTrack } from '../../hooks/useMedia';

interface AudioCategoryCardProps {
    category: string;
    emoji: string;
    label: string;
}

function TrackItem({ track, onPlay }: { track: AudioTrack; onPlay: (t: AudioTrack) => void }) {
    return (
        <Pressable style={styles.trackItem} onPress={() => onPlay(track)}>
            <Text style={styles.trackEmoji}>{track.thumbnail_emoji}</Text>
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.trackDuration}>{track.duration_label}</Text>
            </View>
            <Text style={styles.playIcon}>▶️</Text>
        </Pressable>
    );
}

export default function AudioCategoryCard({ category, emoji, label }: AudioCategoryCardProps) {
    const { data, isLoading } = useAudioLibrary(category);
    const playTrack = usePlayTrack();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>{emoji}</Text>
                <Text style={styles.headerLabel}>{label}</Text>
            </View>

            {isLoading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : data?.tracks && data.tracks.length > 0 ? (
                <View>
                    {data.tracks.map((track) => (
                        <TrackItem
                            key={track.id}
                            track={track}
                            onPlay={playTrack}
                        />
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
    },
    headerEmoji: { fontSize: 22, marginRight: spacing.sm },
    headerLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.textPrimary,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    trackEmoji: { fontSize: 20, marginRight: spacing.sm },
    trackInfo: { flex: 1 },
    trackTitle: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textPrimary,
    },
    trackDuration: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textGhost,
    },
    playIcon: { fontSize: 14, marginLeft: spacing.sm },
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
