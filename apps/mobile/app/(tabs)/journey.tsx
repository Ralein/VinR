/**
 * Journey Screen — 21-day streak tracker (stub for Sprint 1.4)
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export default function JourneyScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Your Journey</Text>
                <Text style={styles.streakCount}>0</Text>
                <Text style={styles.streakLabel}>day streak 🔥</Text>
                <Text style={styles.hint}>Complete a check-in to start your 21-day journey</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28,
        color: colors.textPrimary, marginBottom: 32,
    },
    streakCount: { fontSize: 72, color: colors.gold, fontWeight: '900' },
    streakLabel: {
        fontFamily: 'DMSans_400Regular', fontSize: 18,
        color: colors.textMuted, marginBottom: 32,
    },
    hint: {
        fontFamily: 'DMSans_300Light', fontSize: 14,
        color: colors.textGhost, textAlign: 'center',
    },
});
