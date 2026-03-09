/**
 * Home / Dashboard — Main tab screen
 */

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Greeting */}
                <Text style={styles.greeting}>Good morning</Text>
                <Text style={styles.name}>Welcome to VinR</Text>

                {/* Streak Badge */}
                <View style={styles.streakCard}>
                    <Text style={styles.streakNumber}>0</Text>
                    <Text style={styles.streakLabel}>day streak 🔥</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How are you feeling?</Text>
                    <View style={styles.quickAction}>
                        <Text style={styles.quickActionText}>Start a check-in →</Text>
                    </View>
                </View>

                {/* Today's Habit */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today's Habit</Text>
                    <View style={styles.habitCard}>
                        <Text style={styles.habitEmoji}>🧘</Text>
                        <Text style={styles.habitText}>Complete a check-in to get your personalized plan</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
    },
    greeting: {
        fontFamily: 'DMSans_300Light',
        fontSize: 14,
        color: colors.textMuted,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    name: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        color: colors.textPrimary,
        marginTop: 4,
        marginBottom: 24,
    },
    streakCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 32,
    },
    streakNumber: {
        fontSize: 48,
        color: colors.gold,
        fontWeight: '900',
    },
    streakLabel: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: 12,
    },
    quickAction: {
        backgroundColor: colors.gold,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    quickActionText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        color: colors.void,
    },
    habitCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    habitEmoji: {
        fontSize: 32,
        marginRight: 16,
    },
    habitText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
        flex: 1,
    },
});
