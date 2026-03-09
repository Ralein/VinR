/**
 * Onboarding Step 2 — "How have you been feeling lately?"
 */
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

export default function Step2Mood() {
    return (
        <View style={styles.container}>
            <Text style={styles.step}>Step 2 of 4</Text>
            <Text style={styles.title}>How have you been feeling lately?</Text>
            <Text style={styles.subtitle}>No pressure — this helps us personalize for you</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void, justifyContent: 'center', alignItems: 'center', padding: 32 },
    step: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
    title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: colors.textMuted, textAlign: 'center' },
});
