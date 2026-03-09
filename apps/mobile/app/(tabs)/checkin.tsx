/**
 * Check-in Screen — Daily mood check-in (stub for Sprint 1.3)
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export default function CheckinScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>How are you feeling?</Text>
                <Text style={styles.subtitle}>Select your mood and tell us what's on your mind</Text>
                <Text style={styles.badge}>🔒 Private & secure</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28,
        color: colors.textPrimary, marginBottom: 12, textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular', fontSize: 16,
        color: colors.textMuted, textAlign: 'center', marginBottom: 24,
    },
    badge: {
        fontFamily: 'DMSans_300Light', fontSize: 12,
        color: colors.textGhost,
    },
});
