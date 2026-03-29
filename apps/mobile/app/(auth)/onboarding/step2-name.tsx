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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { 
    FadeIn, 
    FadeInDown, 
    FadeOut,
} from 'react-native-reanimated';
import { User, ArrowRight, Check } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width, height } = Dimensions.get('window');

export default function Step2Name() {
    const { colors, fonts, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleNext = () => {
        if (name.trim().length >= 2) {
            router.push('/onboarding/step3-age');
        }
    };

    const isNameValid = name.trim().length >= 2;

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
                    <ProgressDots currentStep={2} totalSteps={9} />
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}
                        style={[styles.title, { color: colors.textPrimary }]}
                    >
                        How shall we address you?
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}
                        style={[styles.subtitle, { color: colors.textSecondary }]}
                    >
                        Excellence begins with a name.
                    </Animated.Text>
                </View>

                <Animated.View 
                    entering={FadeInDown.duration(1000).delay(600).springify().damping(15)}
                    style={styles.inputSection}
                >
                    <GlassCard accent={isFocused ? 'gold' : undefined} glow={isFocused}>
                        <View style={styles.inputContainer}>
                            <View style={[styles.iconWrapper, { backgroundColor: `${colors.gold}15` }]}>
                                <User size={22} color={isFocused ? colors.gold : colors.textGhost} strokeWidth={1.5} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="Full Name"
                                placeholderTextColor={colors.textGhost}
                                value={name}
                                onChangeText={setName}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                autoFocus
                                autoCorrect={false}
                                selectionColor={colors.gold}
                            />
                            {isNameValid && (
                                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.validBadge}>
                                    <Check size={14} color={colors.gold} strokeWidth={4} />
                                </Animated.View>
                            )}
                        </View>
                    </GlassCard>
                </Animated.View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(1000).delay(800).springify().damping(15)}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                isNameValid 
                                    ? { backgroundColor: colors.gold } 
                                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                                pressed && isNameValid && styles.buttonPressed,
                                !isNameValid && styles.buttonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={!isNameValid}
                        >
                            <Text style={[
                                styles.buttonText,
                                { color: isNameValid ? colors.void : colors.textGhost }
                            ]}>
                                Continue
                            </Text>
                            <ArrowRight 
                                size={20} 
                                color={isNameValid ? colors.void : colors.textGhost} 
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
        marginBottom: 40,
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
        marginTop: 20,
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 16,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontFamily: 'DMSans_500Medium',
        fontSize: 18,
    },
    validBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
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
