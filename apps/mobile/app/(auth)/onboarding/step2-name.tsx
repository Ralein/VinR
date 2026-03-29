import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    Pressable, 
    KeyboardAvoidingView, 
    Platform,
    Dimensions,
    Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import Animated, { 
    FadeIn, 
    FadeInDown, 
    FadeOut,
    useAnimatedStyle,
    interpolateColor,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { User, ArrowRight, Check } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width, height } = Dimensions.get('window');

export default function Step2Name() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);

    useEffect(() => {
        focusAnim.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    }, [isFocused]);

    const handleNext = () => {
        if (name.trim().length > 0) {
            router.push('/onboarding/step3-age');
        }
    };

    const inputBorderStyle = useAnimatedStyle(() => {
        return {
            borderColor: interpolateColor(
                focusAnim.value,
                [0, 1],
                ['rgba(212,168,83,0.2)', theme.colors.gold]
            ),
            backgroundColor: interpolateColor(
                focusAnim.value,
                [0, 1],
                ['rgba(212, 175, 55, 0.03)', 'rgba(212, 175, 55, 0.08)']
            ),
        };
    });

    const isNameValid = name.trim().length >= 2;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <AmbientBackground />
            <View style={[styles.content, { paddingTop: Math.max(insets.top + 20, 40), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
                <View style={styles.header}>
                    <ProgressDots currentStep={2} totalSteps={9} />
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        What should we call you?
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        Please enter your name as you'd like it to appear in the community.
                    </Animated.Text>
                </View>

                <Animated.View 
                    entering={FadeInDown.duration(800).delay(600).springify()}
                    style={styles.inputSection}
                >
                    <GlassCard accent={isFocused ? 'gold' : undefined} shimmer={isFocused}>
                        <View style={styles.inputContainer}>
                            <View style={styles.iconWrapper}>
                                <User size={22} color={isFocused ? theme.colors.gold : theme.colors.textGhost} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Name"
                                placeholderTextColor={theme.colors.textGhost}
                                value={name}
                                onChangeText={setName}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                autoFocus
                                autoCorrect={false}
                                selectionColor={theme.colors.gold}
                            />
                            {isNameValid && (
                                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.validBadge}>
                                    <Check size={14} color={theme.colors.gold} strokeWidth={4} />
                                </Animated.View>
                            )}
                        </View>
                    </GlassCard>
                </Animated.View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(800).delay(800).springify()}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                !isNameValid && styles.buttonDisabled,
                                pressed && isNameValid && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!isNameValid}
                        >
                            <LinearGradient
                                colors={isNameValid ? [theme.colors.gold, theme.colors.goldLight] : [theme.colors.elevated, theme.colors.surface]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    !isNameValid && { color: '#666' }
                                ]}>
                                    Continue
                                </Text>
                                <ArrowRight size={20} color={isNameValid ? theme.colors.void : '#666'} strokeWidth={3} />
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
        marginTop: 20,
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
        marginTop: 60,
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.goldMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontFamily: 'DMSans_500Medium',
        fontSize: 18,
        color: theme.colors.textPrimary,
        height: '100%',
    },
    validBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.goldGlow,
        justifyContent: 'center',
        alignItems: 'center',
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
