import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    Pressable, 
    KeyboardAvoidingView, 
    Platform,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { 
    FadeInDown, 
    FadeIn,
} from 'react-native-reanimated';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width, height } = Dimensions.get('window');

export default function Step3Age() {
    const { colors, fonts, borderRadius, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [age, setAge] = useState('');

    const handleNext = () => {
        if (age.length > 0 && isAgeValid) {
            router.push('/onboarding/step4-avatar');
        }
    };

    const isAgeValid = parseInt(age) >= 13 && parseInt(age) <= 100;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.container, { backgroundColor: colors.void }]}
        >
            <AmbientBackground minimal={true} />
            <View style={[styles.content, { 
                paddingTop: insets.top + (height > 800 ? 40 : 20), 
                paddingBottom: insets.bottom + 20 
            }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.textSecondary} strokeWidth={1.5} />
                    </Pressable>
                    <ProgressDots currentStep={3} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}
                        style={[styles.title, { color: colors.textPrimary }]}
                    >
                        How old are you?
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}
                        style={[styles.subtitle, { color: colors.textSecondary }]}
                    >
                        VinR experiences are tailored to your stage of life.
                    </Animated.Text>
                </View>

                <Animated.View 
                    entering={FadeInDown.duration(1000).delay(600).springify().damping(15)}
                    style={styles.inputSection}
                >
                    <GlassCard accent={isAgeValid ? 'gold' : undefined} shimmer={age.length > 0} >
                        <View style={styles.ageInputContainer}>
                            <TextInput
                                style={[styles.input, { color: colors.gold }]}
                                placeholder="00"
                                placeholderTextColor={`${colors.gold}20`}
                                value={age}
                                onChangeText={(text) => setAge(text.replace(/[^0-9]/g, '').slice(0, 2))}
                                keyboardType="number-pad"
                                maxLength={2}
                                autoFocus
                                selectionColor={colors.gold}
                            />
                            <Text style={[styles.yearsText, { color: colors.textSecondary }]}>years</Text>
                        </View>
                    </GlassCard>
                    {!isAgeValid && age.length === 2 && (
                        <Animated.Text 
                            entering={FadeIn}
                            style={[styles.errorText, { color: colors.crimson }]}
                        >
                            Must be 13 or older.
                        </Animated.Text>
                    )}
                </Animated.View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(1000).delay(800).springify().damping(15)}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                isAgeValid 
                                    ? { backgroundColor: colors.gold } 
                                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                                pressed && isAgeValid && styles.buttonPressed,
                                !isAgeValid && styles.buttonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={!isAgeValid}
                        >
                            <Text style={[
                                styles.buttonText,
                                { color: isAgeValid ? colors.void : colors.textGhost }
                            ]}>
                                Continue
                            </Text>
                            <ArrowRight 
                                size={20} 
                                color={isAgeValid ? colors.void : colors.textGhost} 
                                strokeWidth={3} 
                            />
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 0,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
        marginTop: 32,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 12,
        opacity: 0.7,
    },
    inputSection: {
        marginTop: 60,
        flex: 1,
        alignItems: 'center',
    },
    ageInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 32,
        paddingVertical: 12,
    },
    input: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 100,
        textAlign: 'center',
        minWidth: 120,
    },
    yearsText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 24,
        marginLeft: 16,
    },
    errorText: {
        marginTop: 16,
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
    },
    footer: {
        width: '100%',
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    buttonDisabled: {
        opacity: 0.3,
    },
    buttonText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
});
