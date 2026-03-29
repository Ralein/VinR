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
import { theme } from '../../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import Animated, { 
    FadeInDown, 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width } = Dimensions.get('window');

export default function Step3Age() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [age, setAge] = useState('');

    const handleNext = () => {
        if (age.length > 0) {
            router.push('/onboarding/step4-avatar');
        }
    };

    const isAgeValid = parseInt(age) >= 13 && parseInt(age) <= 100;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <AmbientBackground />
            <View style={[styles.content, { paddingTop: Math.max(insets.top + 20, 40), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.textSecondary} />
                    </Pressable>
                    <ProgressDots currentStep={3} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        How old are you?
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        Your age helps us personalize your journey and connect you with the right community.
                    </Animated.Text>
                </View>

                <Animated.View 
                    entering={FadeInDown.duration(800).delay(600).springify()}
                    style={styles.inputSection}
                >
                    <GlassCard accent={isAgeValid ? 'gold' : undefined} shimmer={age.length > 0} >
                        <View style={styles.ageInputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="00"
                                placeholderTextColor="rgba(212,168,83,0.2)"
                                value={age}
                                onChangeText={(text) => setAge(text.replace(/[^0-9]/g, '').slice(0, 2))}
                                keyboardType="number-pad"
                                maxLength={2}
                                autoFocus
                                selectionColor={theme.colors.gold}
                            />
                            <Text style={styles.yearsText}>years old</Text>
                        </View>
                    </GlassCard>
                </Animated.View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(800).delay(800).springify()}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                !isAgeValid && styles.buttonDisabled,
                                pressed && isAgeValid && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!isAgeValid}
                        >
                            <LinearGradient
                                colors={isAgeValid ? [theme.colors.gold, theme.colors.goldLight] : [theme.colors.elevated, theme.colors.surface]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    !isAgeValid && { color: '#666' }
                                ]}>
                                    Continue
                                </Text>
                                <ArrowRight size={20} color={isAgeValid ? theme.colors.void : '#666'} strokeWidth={3} />
                            </LinearGradient>
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
        backgroundColor: theme.colors.void,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginTop: 0,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.textPrimary,
        marginTop: 32,
        fontSize: 32,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: 12,
        fontSize: 16,
        lineHeight: 24,
    },
    inputSection: {
        marginTop: 80,
        flex: 1,
        alignItems: 'center',
    },
    ageInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 16,
    },
    input: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 120,
        color: theme.colors.gold,
        textAlign: 'center',
        minWidth: 150,
        // Using a subtle text shadow for a more premium look
        textShadowColor: 'rgba(212,168,83,0.4)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    yearsText: {
        ...theme.typography.h3,
        color: theme.colors.textSecondary,
        fontSize: 24,
    },
    footer: {
        marginTop: 'auto',
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
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
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 18,
        color: theme.colors.void,
        letterSpacing: 0.5,
    },
});
