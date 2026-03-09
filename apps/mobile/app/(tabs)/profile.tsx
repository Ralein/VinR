/**
 * Profile Screen — Settings + user profile (stub)
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                </View>
                <Text style={styles.name}>VinR User</Text>
                <Text style={styles.tier}>Free Plan</Text>
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
    avatarPlaceholder: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.surface, alignItems: 'center',
        justifyContent: 'center', borderWidth: 2, borderColor: colors.gold,
        marginBottom: 16,
    },
    avatarEmoji: { fontSize: 36 },
    name: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 20,
        color: colors.textPrimary, marginBottom: 4,
    },
    tier: {
        fontFamily: 'DMSans_400Regular', fontSize: 14,
        color: colors.textMuted,
    },
});
