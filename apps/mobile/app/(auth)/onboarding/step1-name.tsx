/**
 * Onboarding Step 1 — "What should we call you?"
 */
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

export default function Step1Name() {
    return (
        <View style={styles.container}>
            <Text style={styles.step}>Step 1 of 4</Text>
            <Text style={styles.title}>What should we call you?</Text>
            <Text style={styles.subtitle}>Pick a name and avatar</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void, justifyContent: 'center', alignItems: 'center', padding: 32 },
    step: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
    title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: colors.textMuted, textAlign: 'center' },
});
