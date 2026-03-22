/**
 * Loading Screen — "Void Emergence" design language
 *
 * Gyroscope rings pulse around the vinR wordmark.
 * Affirmations cross-fade with letter-spacing focus-pull.
 * Animated dot-wave progress indicator.
 * Ambient blobs + particles for atmospheric depth.
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue, useAnimatedStyle,
    withRepeat, withSequence, withTiming, withDelay,
    withSpring, Easing, interpolate,
} from 'react-native-reanimated';
import { haptics } from '../../services/haptics';
import { useCheckinStore } from '../../stores/checkinStore';
import { useCheckin } from '../../hooks/useCheckin';

const { width, height } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD        = '#D4AF37';
const GOLD_BRIGHT = '#F2C84B';
const VOID        = '#05040E';
const TEXT_HI     = '#ECEAF6';
const TEXT_MID    = 'rgba(236,234,246,0.52)';
const TEXT_LO     = 'rgba(236,234,246,0.22)';

const AFFIRMATIONS = [
    "You are not your worst moments.",
    "Every emotion is valid.",
    "Asking for help is strength.",
    "This feeling will pass.",
    "You deserve to feel better.",
    "Small steps lead to big changes.",
    "You are worth fighting for.",
];

// ─── Orbit Ring ───────────────────────────────────────────────────────────────
function OrbitRing({ size, duration, reverse = false, delay: d, variant = 'primary' }: {
    size: number; duration: number; reverse?: boolean;
    delay: number; variant?: 'primary' | 'secondary' | 'micro';
}) {
    const rot = useSharedValue(0);
    const op  = useSharedValue(0);

    useEffect(() => {
        op.value  = withDelay(d, withTiming(1, { duration: 800 }));
        rot.value = withRepeat(
            withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }),
            -1, false
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }],
        opacity: op.value,
    }));

    const ringStyle = variant === 'primary' ? {
        borderTopColor:    'rgba(212,175,55,0.75)',
        borderRightColor:  'rgba(212,175,55,0.18)',
        borderBottomColor: 'transparent',
        borderLeftColor:   'rgba(212,175,55,0.18)',
        borderWidth: 1,
    } : variant === 'secondary' ? {
        borderTopColor:    'rgba(123,94,248,0.4)',
        borderRightColor:  'rgba(123,94,248,0.08)',
        borderBottomColor: 'transparent',
        borderLeftColor:   'rgba(123,94,248,0.08)',
        borderWidth: 0.75,
    } : {
        borderTopColor:    'rgba(212,175,55,0.15)',
        borderRightColor:  'transparent',
        borderBottomColor: 'rgba(212,175,55,0.06)',
        borderLeftColor:   'transparent',
        borderWidth: 0.5,
    };

    return (
        <Animated.View style={[{
            position: 'absolute',
            width: size, height: size, borderRadius: size / 2,
            ...ringStyle,
        }, style]} />
    );
}

// ─── Ambient Blob ─────────────────────────────────────────────────────────────
function AmbientBlob({ color, size, top, left, right, delay: d, duration }: {
    color: string; size: number; top: number;
    left?: number; right?: number; delay: number; duration: number;
}) {
    const scale = useSharedValue(0.85);
    const op    = useSharedValue(0);
    const tx    = useSharedValue(0);
    const ty    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(1, { duration: 1400 }));
        scale.value = withRepeat(
            withSequence(
                withTiming(1.18, { duration, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.85, { duration, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        );
        tx.value = withDelay(d + 400, withRepeat(
            withSequence(
                withTiming(28, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
                withTiming(-28, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
        ty.value = withDelay(d + 900, withRepeat(
            withSequence(
                withTiming(-22, { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) }),
                withTiming(22,  { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ scale: scale.value }, { translateX: tx.value }, { translateY: ty.value }],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute', width: size, height: size,
            borderRadius: size / 2, backgroundColor: color, top, left, right,
        }, style]} />
    );
}

// ─── Particle ─────────────────────────────────────────────────────────────────
function Particle({ x, y, r, delay: d, color = GOLD_BRIGHT }: {
    x: number; y: number; r: number; delay: number; color?: string;
}) {
    const op = useSharedValue(0);
    const ty = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(d, withTiming(0.7, { duration: 1000 }));
        ty.value = withDelay(d, withRepeat(
            withSequence(
                withTiming(-14, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(14,  { duration: 2800, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateY: ty.value }],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute', left: x, top: y,
            width: r, height: r, borderRadius: r / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1, shadowRadius: r * 3,
        }, style]} />
    );
}

// ─── Pulse Ring (breathing halo around logo) ──────────────────────────────────
function PulseRing({ size, delay: d }: { size: number; delay: number }) {
    const scale = useSharedValue(1);
    const op    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(0.5, { duration: 600 }));
        scale.value = withDelay(d, withRepeat(
            withSequence(
                withTiming(1.35, { duration: 2000, easing: Easing.out(Easing.quad) }),
                withTiming(1,    { duration: 2000, easing: Easing.in(Easing.quad) })
            ), -1, false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: interpolate(scale.value, [1, 1.35], [0.35, 0]),
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute',
            width: size, height: size, borderRadius: size / 2,
            borderWidth: 1,
            borderColor: 'rgba(212,175,55,0.6)',
        }, style]} />
    );
}

// ─── Wave Dots ────────────────────────────────────────────────────────────────
function WaveDots() {
    const dots = [0, 1, 2, 3, 4];

    return (
        <View style={s.dotsRow}>
            {dots.map(i => <WaveDot key={i} index={i} />)}
        </View>
    );
}

function WaveDot({ index }: { index: number }) {
    const ty = useSharedValue(0);
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(300 + index * 80, withTiming(1, { duration: 400 }));
        ty.value = withDelay(500 + index * 100, withRepeat(
            withSequence(
                withTiming(-8, { duration: 400, easing: Easing.inOut(Easing.sin) }),
                withTiming(0,  { duration: 400, easing: Easing.inOut(Easing.sin) })
            ), -1, false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateY: ty.value }],
    }));

    return (
        <Animated.View style={[s.dot, style]} />
    );
}

// ─── Affirmation Text (focus-pull cross-fade) ─────────────────────────────────
function AffirmationDisplay({ text }: { text: string }) {
    const op  = useSharedValue(0);
    const spc = useSharedValue(4);

    useEffect(() => {
        op.value  = withTiming(1,    { duration: 500 });
        spc.value = withTiming(0.15, { duration: 600, easing: Easing.out(Easing.quad) });
        return () => {
            op.value  = withTiming(0, { duration: 300 });
        };
    }, [text]);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        letterSpacing: spc.value,
    }));

    return (
        <Animated.Text style={[s.affirmation, style]}>
            "{text}"
        </Animated.Text>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoadingScreen() {
    const { selectedMood, inputText, setAnalyzing } = useCheckinStore();
    const checkin = useCheckin();
    const [affirmationIndex, setAffirmationIndex] = useState(0);

    // Logo entrance
    const logoOp = useSharedValue(0);
    const logoY  = useSharedValue(20);

    // Subtitle + status
    const subOp     = useSharedValue(0);
    const subY      = useSharedValue(10);
    const statusOp  = useSharedValue(0);

    useEffect(() => {
        logoOp.value  = withDelay(200, withTiming(1, { duration: 600 }));
        logoY.value   = withDelay(200, withSpring(0, { stiffness: 90, damping: 16 }));
        subOp.value   = withDelay(600, withTiming(1, { duration: 500 }));
        subY.value    = withDelay(600, withSpring(0, { stiffness: 100, damping: 18 }));
        statusOp.value = withDelay(900, withTiming(1, { duration: 500 }));
    }, []);

    // Affirmation rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setAffirmationIndex(prev => (prev + 1) % AFFIRMATIONS.length);
        }, 3200);
        return () => clearInterval(timer);
    }, []);

    // API call
    useEffect(() => {
        if (!selectedMood) { router.back(); return; }
        setAnalyzing(true);
        checkin.mutate(
            { mood_tag: selectedMood, text: inputText || null },
            {
                onSuccess: (data) => {
                    setAnalyzing(false);
                    haptics.success();
                    if (data.plan.isEmergency) {
                        router.replace('/(tabs)/emergency');
                    } else {
                        router.replace('/(tabs)/results');
                    }
                },
                onError: () => {
                    setAnalyzing(false);
                    haptics.error();
                    router.replace('/(tabs)/results');
                },
            }
        );
    }, []);

    const logoStyle   = useAnimatedStyle(() => ({ opacity: logoOp.value, transform: [{ translateY: logoY.value }] }));
    const subStyle    = useAnimatedStyle(() => ({ opacity: subOp.value,  transform: [{ translateY: subY.value  }] }));
    const statusStyle = useAnimatedStyle(() => ({ opacity: statusOp.value }));

    return (
        <View style={s.container}>

            {/* Background */}
            <LinearGradient
                colors={['#05040E', '#0C0A1C', '#120F28', '#080614', '#05040E']}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.75, y: 1 }}
            />
            <LinearGradient
                colors={['rgba(123,94,248,0.06)', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0.2 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Ambient blobs */}
            <AmbientBlob color="rgba(212,175,55,0.065)" size={420} top={height * 0.02} left={-90}          delay={200} duration={5400} />
            <AmbientBlob color="rgba(123,94,248,0.10)"  size={360} top={height * 0.08} right={-100}        delay={400} duration={6600} />
            <AmbientBlob color="rgba(40,90,210,0.06)"   size={280} top={height * 0.62} right={-60}         delay={300} duration={7800} />
            <AmbientBlob color="rgba(212,175,55,0.04)"  size={220} top={height * 0.56} left={width * 0.2}  delay={600} duration={5000} />

            {/* Particles */}
            <Particle x={width * 0.08} y={height * 0.14} r={2.5} delay={500} />
            <Particle x={width * 0.84} y={height * 0.10} r={2}   delay={800} />
            <Particle x={width * 0.92} y={height * 0.44} r={2}   delay={1100} />
            <Particle x={width * 0.06} y={height * 0.66} r={2}   delay={1400} color="rgba(160,110,255,0.8)" />
            <Particle x={width * 0.78} y={height * 0.74} r={1.5} delay={1700} color="rgba(160,110,255,0.7)" />

            {/* ── Logo zone ── */}
            <Animated.View style={[s.logoZone, logoStyle]}>

                {/* Gyroscope rings */}
                <OrbitRing size={158} duration={7200}  delay={300} variant="primary"   />
                <OrbitRing size={198} duration={12000} delay={500} variant="secondary" reverse />
                <OrbitRing size={244} duration={18000} delay={700} variant="primary"   />
                <OrbitRing size={290} duration={28000} delay={900} variant="micro"     reverse />

                {/* Pulse halos */}
                <PulseRing size={130} delay={800} />
                <PulseRing size={158} delay={1400} />

                {/* Glow beds */}
                <View style={s.logoBedOuter} />
                <View style={s.logoBed} />
                <View style={s.logoRingStatic} />
                <View style={s.logoRingMicro} />

                {/* Wordmark */}
                <View style={s.wordmark}>
                    <Text style={s.logoVin}>vin</Text>
                    <Text style={s.logoR}>R</Text>
                </View>
            </Animated.View>

            {/* ── Subtitle ── */}
            <Animated.View style={[s.subtitleWrap, subStyle]}>
                <Text style={s.subtitle}>Reading your signal</Text>
                <WaveDots />
            </Animated.View>

            {/* ── Affirmation ── */}
            <AffirmationDisplay text={AFFIRMATIONS[affirmationIndex]} />

            {/* ── Status line ── */}
            <Animated.Text style={[s.status, statusStyle]}>
                AI analysis in progress
            </Animated.Text>

        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },

    // Logo
    logoZone: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logoBedOuter: {
        position: 'absolute',
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(212,175,55,0.04)',
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.22, shadowRadius: 90,
    },
    logoBed: {
        position: 'absolute',
        width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(212,175,55,0.08)',
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55, shadowRadius: 48,
    },
    logoRingStatic: {
        position: 'absolute',
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 0.5,
        borderColor: 'rgba(212,175,55,0.32)',
    },
    logoRingMicro: {
        position: 'absolute',
        width: 96, height: 96, borderRadius: 48,
        borderWidth: 0.5,
        borderColor: 'rgba(212,175,55,0.12)',
    },
    wordmark: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logoVin: {
        fontFamily: 'DMSans_300Light',
        fontSize: 38, color: TEXT_HI,
        letterSpacing: -0.5,
    },
    logoR: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 46, color: GOLD,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(212,175,55,0.65)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },

    // Subtitle + dots
    subtitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 28,
    },
    subtitle: {
        fontFamily: 'DMSans_300Light',
        fontSize: 16, color: TEXT_MID,
        letterSpacing: 0.2,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        width: 4, height: 4, borderRadius: 2,
        backgroundColor: GOLD,
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 4,
    },


    affirmation: {
        fontFamily: 'DMSans_300Light',
        fontSize: 15.5,
        color: 'rgba(212,175,55,0.7)',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 24,
        marginBottom: 36,
        paddingHorizontal: 16,
    },

    // Status
    status: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: TEXT_LO,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
});