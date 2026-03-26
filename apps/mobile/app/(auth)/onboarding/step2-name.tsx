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
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
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

const { width, height } = Dimensions.get('window');

export default function Step2Name() {
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
                ['rgba(212, 175, 55, 0.2)', Colors.gold]
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
            <View style={styles.content}>
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
                    <Animated.View style={[styles.inputContainer, inputBorderStyle]}>
                        <View style={styles.iconWrapper}>
                            <User size={22} color={isFocused ? Colors.gold : Colors.textGhost} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Your Name"
                            placeholderTextColor={Colors.textGhost}
                            value={name}
                            onChangeText={setName}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            autoFocus
                            autoCorrect={false}
                            selectionColor={Colors.gold}
                        />
                        {isNameValid && (
                            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.validBadge}>
                                <Check size={14} color={Colors.gold} strokeWidth={4} />
                            </Animated.View>
                        )}
                    </Animated.View>
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
                                colors={isNameValid ? [Colors.gold, '#B8860B'] : ['#333', '#222']}
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
                                <ArrowRight size={20} color={isNameValid ? Colors.void : '#666'} strokeWidth={3} />
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
        backgroundColor: Colors.void,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
    },
    title: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginTop: 32,
        fontSize: 32,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
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
        height: 72,
        borderRadius: 20,
        borderWidth: 1.5,
        paddingHorizontal: 20,
        gap: 12,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontFamily: 'DMSans_500Medium',
        fontSize: 18,
        color: Colors.textPrimary,
        height: '100%',
    },
    validBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
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
        color: Colors.void,
        letterSpacing: 0.5,
    },
});
