/**
 * Sign Up Screen — stub for Sprint 1.2
 */

import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export default function SignUpScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your comeback starts now</Text>
            <Text style={styles.subtitle}>Create your VinR account</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
    },
});
