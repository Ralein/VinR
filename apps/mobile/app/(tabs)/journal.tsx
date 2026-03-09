/**
 * Journal Screen — Gratitude journal (stub for Sprint 2.2)
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export default function JournalScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Gratitude Journal</Text>
                <Text style={styles.subtitle}>What are you grateful for today?</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28,
        color: colors.textPrimary, marginBottom: 12,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular', fontSize: 16,
        color: colors.textMuted, textAlign: 'center',
    },
});
