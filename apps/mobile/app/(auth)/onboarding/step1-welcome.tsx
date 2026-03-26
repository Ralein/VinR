import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Pressable, 
    Dimensions,
    Platform,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import Animated, { 
    FadeInDown, 
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Step1Welcome() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/onboarding/step2-name');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Background Gradient */}
            <View style={StyleSheet.absoluteFill}>
                <View style={[styles.bgCircle, styles.bgCircle1]} />
                <View style={[styles.bgCircle, styles.bgCircle2]} />
                <LinearGradient
                    colors={['transparent', Colors.void]}
                    style={StyleSheet.absoluteFill}
                    locations={[0, 0.7]}
                />
            </View>

            <View style={styles.content}>
                {/* Hero Section */}
                <Animated.View 
                    entering={FadeInUp.duration(1000).springify()} 
                    style={styles.heroContainer}
                >
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={[Colors.gold, '#B8860B']}
                            style={styles.iconGradient}
                        >
                            <Sparkles size={32} color={Colors.void} />
                        </LinearGradient>
                    </View>
                </Animated.View>

                {/* Text Content */}
                <View style={styles.textSection}>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(300).springify()}
                        style={styles.title}
                    >
                        Welcome to <Text style={styles.highlight}>VinR</Text>
                    </Animated.Text>
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(500).springify()}
                        style={styles.subtitle}
                    >
                        The most exclusive loyalty network for high-end experiences and refined tastes.
                    </Animated.Text>

                    <Animated.View 
                        entering={FadeInDown.duration(800).delay(700).springify()}
                        style={styles.featureRow}
                    >
                        <View style={styles.featureBadge}>
                            <ShieldCheck size={16} color={Colors.gold} />
                            <Text style={styles.featureText}>Premium Security</Text>
                        </View>
                        <View style={styles.featureBadge}>
                            <Sparkles size={16} color={Colors.gold} />
                            <Text style={styles.featureText}>Curated Access</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Footer / CTA */}
                <Animated.View 
                    entering={FadeInDown.duration(800).delay(900).springify()}
                    style={styles.footer}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed
                        ]}
                        onPress={handleNext}
                    >
                        <LinearGradient
                            colors={[Colors.gold, '#B8860B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Enter Excellence</Text>
                            <ArrowRight size={20} color={Colors.void} strokeWidth={3} />
                        </LinearGradient>
                    </Pressable>
                    
                    <Text style={styles.footerText}>
                        Already a member? <Text style={styles.link}>Sign In</Text>
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.void,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: height * 0.15,
        paddingBottom: 40,
    },
    bgCircle: {
        position: 'absolute',
        borderRadius: 1000,
        opacity: 0.15,
    },
    bgCircle1: {
        width: 400,
        height: 400,
        backgroundColor: Colors.gold,
        top: -100,
        right: -100,
    },
    bgCircle2: {
        width: 300,
        height: 300,
        backgroundColor: Colors.gold,
        bottom: 100,
        left: -100,
    },
    heroContainer: {
        alignItems: 'center',
    },
    iconContainer: {
        padding: 4,
        borderRadius: 30,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    textSection: {
        marginTop: 40,
    },
    title: {
        ...Typography.h1,
        color: Colors.textPrimary,
        textAlign: 'center',
        fontSize: 38,
        lineHeight: 46,
    },
    highlight: {
        color: Colors.gold,
        fontWeight: '900',
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 10,
        fontSize: 18,
        lineHeight: 26,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 24,
    },
    featureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.15)',
        gap: 6,
    },
    featureText: {
        ...Typography.caption,
        color: Colors.gold,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
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
    buttonText: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 18,
        color: Colors.void,
        letterSpacing: 1,
    },
    footerText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 24,
    },
    link: {
        color: Colors.gold,
        fontWeight: '700',
    },
});
