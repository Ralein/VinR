/**
 * WelcomeScreen — "Void Emergence"
 *
 * Six signature animation moments:
 *
 * 1. WARP SPEED INTRO (t=0ms)
 *    24 gold streaks explode radially from screen center, each
 *    elongating (scaleX 1→14) as it accelerates outward then fading
 *    at the edge. The "awakening from void" moment.
 *
 * 2. GYROSCOPE RINGS (t=700ms)
 *    Three concentric arcs rotate at different speeds — two clockwise,
 *    one counter-clockwise. Each uses asymmetric border-color opacity
 *    (bright top, faded sides, transparent bottom) so a luminous arc
 *    perpetually sweeps the logo like a targeting reticle.
 *
 * 3. COMET LOGO ASSEMBLY (t=760ms)
 *    "vin" rises from y+24 with a spring snap. "R" rockets in from
 *    x+170 with a gold comet tail (LinearGradient streak to its right)
 *    that flares then fades as it lands. A light-sweep underline then
 *    races beneath the full "vinR" wordmark.
 *
 * 4. RADAR LINE DRAW (t=1200ms)
 *    A 0.5px rule expands from a glowing center node outward to both
 *    edges. A bright dot races along the right arm then disappears —
 *    like an energy scanner activating.
 *
 * 5. FOCUS-PULL TYPOGRAPHY (t=1850ms–2350ms)
 *    Headlines start with wide letterSpacing (soft-focus blur feel),
 *    then compress to tight tracking — the photographic rack-focus
 *    technique. Each line staggered 250ms.
 *
 * 6. LIQUID FILL CTA (t=2550ms)
 *    Button border glows in first. Molten gold floods left→right over
 *    550ms. Label materializes only once fill is complete.
 */

import { useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { animation } from '../../constants/theme';
import { haptics } from '../../services/haptics';

const { width, height } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD        = '#D4AF37';
const GOLD_BRIGHT = '#F2C84B';
const VOID        = '#060510';
const TEXT_HI     = '#ECEAF6';
const TEXT_MID    = 'rgba(236,234,246,0.48)';
const TEXT_LO     = 'rgba(236,234,246,0.2)';
const CTA_W       = width - 56;
const HALF_W      = (width - 56) / 2;

// ─── 1. Warp Streak ───────────────────────────────────────────────────────────

const STREAK_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);
const WARP_DIST     = Math.max(width, height) * 0.76;

function WarpStreak({ angleDeg, delay: d }: { angleDeg: number; delay: number }) {
    const p = useSharedValue(0);

    useEffect(() => {
        p.value = withDelay(d, withTiming(1, { duration: 780, easing: Easing.out(Easing.cubic) }));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: interpolate(p.value, [0, 0.06, 0.48, 1], [0, 1, 0.65, 0]),
        transform: [
            { rotate: `${angleDeg}deg` },
            { translateX: WARP_DIST * p.value },
            { scaleX: interpolate(p.value, [0, 0.1, 1], [1, 5, 14]) },
        ],
    }));

    return (
        <Animated.View
            style={[{
                position: 'absolute',
                width: 3,
                height: 1.5,
                borderRadius: 1,
                backgroundColor: GOLD_BRIGHT,
                left: width / 2 - 1.5,
                top: height / 2 - 0.75,
            }, style]}
        />
    );
}

// ─── 2. Gyroscope Ring ────────────────────────────────────────────────────────

function OrbitRing({
    size, duration, reverse = false, delay: d,
}: {
    size: number; duration: number; reverse?: boolean; delay: number;
}) {
    const rot = useSharedValue(0);
    const op  = useSharedValue(0);

    useEffect(() => {
        op.value  = withDelay(d, withTiming(1, { duration: 700 }));
        rot.value = withDelay(d, withRepeat(
            withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }),
            -1,
            false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }],
        opacity: op.value,
    }));

    return (
        <Animated.View style={[{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderTopColor:    'rgba(212,175,55,0.70)',
            borderRightColor:  'rgba(212,175,55,0.22)',
            borderBottomColor: 'transparent',
            borderLeftColor:   'rgba(212,175,55,0.22)',
        }, style]} />
    );
}

// ─── Ambient Blob ─────────────────────────────────────────────────────────────

function AmbientBlob({
    color, size, top, left, right, delay: d, duration,
}: {
    color: string; size: number; top: number;
    left?: number; right?: number; delay: number; duration: number;
}) {
    const scale = useSharedValue(0.85);
    const op    = useSharedValue(0);
    const tx    = useSharedValue(0);
    const ty    = useSharedValue(0);

    useEffect(() => {
        op.value    = withDelay(d, withTiming(1, { duration: 1200 }));
        scale.value = withDelay(d, withRepeat(
            withSequence(
                withTiming(1.15, { duration,        easing: Easing.inOut(Easing.sin) }),
                withTiming(0.85, { duration,        easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
        // Slow organic drift X
        tx.value = withDelay(d + 400, withRepeat(
            withSequence(
                withTiming( 28, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
                withTiming(-28, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
        // Slow organic drift Y
        ty.value = withDelay(d + 900, withRepeat(
            withSequence(
                withTiming(-22, { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) }),
                withTiming( 22, { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [
            { scale:      scale.value },
            { translateX: tx.value    },
            { translateY: ty.value    },
        ],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute',
            width: size, height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            top, left, right,
        }, style]} />
    );
}

// ─── Particle ─────────────────────────────────────────────────────────────────

function Particle({
    x, y, r, delay: d, color = GOLD_BRIGHT,
}: {
    x: number; y: number; r: number; delay: number; color?: string;
}) {
    const op = useSharedValue(0);
    const ty = useSharedValue(0);
    const tx = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(d, withTiming(0.7, { duration: 1000 }));
        ty.value = withDelay(d, withRepeat(
            withSequence(
                withTiming(-14, { duration: 2600 + d * 0.2, easing: Easing.inOut(Easing.sin) }),
                withTiming( 14, { duration: 2600 + d * 0.2, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
        tx.value = withDelay(d + 400, withRepeat(
            withSequence(
                withTiming(-7, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
                withTiming( 7, { duration: 3800, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateY: ty.value }, { translateX: tx.value }],
    }));

    return (
        <Animated.View style={[{
            position: 'absolute', left: x, top: y,
            width: r, height: r, borderRadius: r / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: r * 2.5,
        }, style]} />
    );
}

// ─── 4. Radar Line ────────────────────────────────────────────────────────────

function RadarLine({ delay: d }: { delay: number }) {
    const lw     = useSharedValue(0);
    const rw     = useSharedValue(0);
    const dotX   = useSharedValue(0);
    const dotOp  = useSharedValue(0);
    const lineOp = useSharedValue(0);
    const arm    = HALF_W - 4;

    useEffect(() => {
        lineOp.value = withDelay(d, withTiming(1, { duration: 150 }));
        lw.value     = withDelay(d, withTiming(arm, { duration: 480, easing: Easing.out(Easing.quad) }));
        rw.value     = withDelay(d, withTiming(arm, { duration: 480, easing: Easing.out(Easing.quad) }));
        dotOp.value  = withDelay(d, withSequence(
            withTiming(1, { duration: 60 }),
            withDelay(440, withTiming(0, { duration: 280 }))
        ));
        dotX.value = withDelay(d, withTiming(arm, { duration: 480, easing: Easing.out(Easing.quad) }));
    }, []);

    const leftStyle  = useAnimatedStyle(() => ({ width: lw.value, opacity: lineOp.value }));
    const rightStyle = useAnimatedStyle(() => ({ width: rw.value, opacity: lineOp.value }));
    const dotStyle   = useAnimatedStyle(() => ({
        opacity: dotOp.value,
        transform: [{ translateX: dotX.value }],
    }));

    return (
        <View style={s.radarWrap}>
            <Animated.View style={[s.radarLineLeft,  leftStyle]}  />
            <View          style={s.radarNode} />
            <Animated.View style={[s.radarLineRight, rightStyle]} />
            <Animated.View style={[s.radarDot, dotStyle]} />
        </View>
    );
}

// ─── Scan Line ────────────────────────────────────────────────────────────────

function ScanLine() {
    const ty = useSharedValue(-40);
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(2000, withTiming(1, { duration: 400 }));
        ty.value = withDelay(2000, withRepeat(
            withSequence(
                withTiming(height + 40, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
                withDelay(4000, withTiming(-40, { duration: 0 }))
            ), -1, false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: ty.value }],
        opacity: op.value,
    }));

    return (
        <Animated.View style={[s.scanWrap, style]} pointerEvents="none">
            <LinearGradient
                colors={['transparent', 'rgba(212,175,55,0.05)', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={{ width: '100%', height: 50 }}
            />
        </Animated.View>
    );
}

// ─── HUD Corner ───────────────────────────────────────────────────────────────

function HudCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
    const l = pos === 'tl' || pos === 'bl';
    const t = pos === 'tl' || pos === 'tr';
    return (
        <View style={[s.hudCorner, {
            top:              t ? 0 : undefined,
            bottom:           t ? undefined : 0,
            left:             l ? 0 : undefined,
            right:            l ? undefined : 0,
            borderTopWidth:    t ? 1 : 0,
            borderBottomWidth: t ? 0 : 1,
            borderLeftWidth:   l ? 1 : 0,
            borderRightWidth:  l ? 0 : 1,
        }]} />
    );
}

// ─── 6. Liquid Fill CTA ──────────────────────────────────────────────────────

function LiquidCTA({ delay: d }: { delay: number }) {
    const borderOp = useSharedValue(0);
    const glowOp   = useSharedValue(0);
    const fillW    = useSharedValue(0);
    const labelOp  = useSharedValue(0);
    const scale    = useSharedValue(1);

    useEffect(() => {
        borderOp.value = withDelay(d,       withTiming(1,    { duration: 320 }));
        glowOp.value   = withDelay(d + 150, withTiming(1,    { duration: 380 }));
        fillW.value    = withDelay(d + 300, withTiming(CTA_W, {
            duration: 550, easing: Easing.inOut(Easing.quad),
        }));
        labelOp.value  = withDelay(d + 880, withTiming(1, { duration: 300 }));
    }, []);

    const borderStyle = useAnimatedStyle(() => ({ opacity: borderOp.value }));
    const glowStyle   = useAnimatedStyle(() => ({ opacity: glowOp.value }));
    const fillStyle   = useAnimatedStyle(() => ({ width: fillW.value }));
    const labelStyle  = useAnimatedStyle(() => ({ opacity: labelOp.value }));
    const pressStyle  = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        haptics.medium();
        scale.value = withSequence(
            withSpring(0.95, { stiffness: 400 }),
            withSpring(1, animation.spring)
        );
        setTimeout(() => router.push('/(auth)/sign-up'), 150);
    };

    return (
        <AnimatedPressable onPress={handlePress} style={[s.ctaOuter, pressStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, s.ctaGlow,   glowStyle]}   />
            <Animated.View style={[StyleSheet.absoluteFill, s.ctaBorder, borderStyle]} />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 16 }]}>
                <Animated.View style={[{ height: '100%' }, fillStyle]}>
                    <LinearGradient
                        colors={[GOLD_BRIGHT, GOLD, '#BF961E']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                    />
                </Animated.View>
            </View>
            <Animated.View style={[StyleSheet.absoluteFill, s.ctaLabelRow, labelStyle]}>
                <Text style={s.ctaText}>Begin your comeback</Text>
                <View style={s.ctaArrowCircle}>
                    <Text style={s.ctaArrow}>›</Text>
                </View>
            </Animated.View>
        </AnimatedPressable>
    );
}

// ─── Trust Pill ───────────────────────────────────────────────────────────────

function TrustPill({ icon, label }: { icon: string; label: string }) {
    return (
        <View style={s.trustPill}>
            <Text style={s.trustIcon}>{icon}</Text>
            <Text style={s.trustLabel}>{label}</Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WelcomeScreen() {

    // Logo
    const vinOp    = useSharedValue(0);
    const vinY     = useSharedValue(24);
    const rX       = useSharedValue(170);
    const rOp      = useSharedValue(0);
    const streakOp = useSharedValue(0);
    const uLineX   = useSharedValue(-60);
    const uLineOp  = useSharedValue(0);
    const logoOp   = useSharedValue(0);

    // Headline
    const eyeOp  = useSharedValue(0);
    const eyeY   = useSharedValue(10);
    const h1Op   = useSharedValue(0);
    const h1Y    = useSharedValue(18);
    const h1Spc  = useSharedValue(7);
    const h2Op   = useSharedValue(0);
    const h2Y    = useSharedValue(18);
    const h2Spc  = useSharedValue(7);
    const subOp  = useSharedValue(0);
    const subY   = useSharedValue(14);

    // Bottom
    const hudOp    = useSharedValue(0);
    const signInOp = useSharedValue(0);
    const trustOp  = useSharedValue(0);

    useEffect(() => {
        hudOp.value    = withDelay(900,  withTiming(1, { duration: 600 }));
        logoOp.value   = withDelay(700,  withTiming(1, { duration: 250 }));

        // "vin" rises
        vinOp.value    = withDelay(760,  withTiming(1, { duration: 500 }));
        vinY.value     = withDelay(760,  withSpring(0, { stiffness: 90, damping: 15 }));

        // "R" rockets in
        rOp.value      = withDelay(960,  withTiming(1, { duration: 100 }));
        rX.value       = withDelay(960,  withSpring(0, { stiffness: 130, damping: 18, velocity: -60 }));
        streakOp.value = withDelay(960,  withSequence(
            withTiming(1,   { duration: 55  }),
            withTiming(0.7, { duration: 260 }),
            withTiming(0,   { duration: 180 })
        ));

        // Underline sweep
        uLineOp.value  = withDelay(1450, withSequence(
            withTiming(1, { duration: 60 }),
            withDelay(500, withTiming(0, { duration: 200 }))
        ));
        uLineX.value   = withDelay(1450, withTiming(220, {
            duration: 500, easing: Easing.out(Easing.quad),
        }));

        // 5. Focus-pull headlines
        eyeOp.value    = withDelay(1650, withTiming(1,  { duration: 480 }));
        eyeY.value     = withDelay(1650, withSpring(0,  { stiffness: 120, damping: 18 }));
        h1Op.value     = withDelay(1850, withTiming(1,  { duration: 520 }));
        h1Y.value      = withDelay(1850, withSpring(0,  { stiffness: 90, damping: 16 }));
        h1Spc.value    = withDelay(1850, withTiming(-1.5, { duration: 580, easing: Easing.out(Easing.quad) }));
        h2Op.value     = withDelay(2100, withTiming(1,  { duration: 520 }));
        h2Y.value      = withDelay(2100, withSpring(0,  { stiffness: 90, damping: 16 }));
        h2Spc.value    = withDelay(2100, withTiming(-2, { duration: 580, easing: Easing.out(Easing.quad) }));
        subOp.value    = withDelay(2350, withTiming(1,  { duration: 500 }));
        subY.value     = withDelay(2350, withSpring(0,  { stiffness: 110, damping: 20 }));

        signInOp.value = withDelay(3250, withTiming(1, { duration: 500 }));
        trustOp.value  = withDelay(3400, withTiming(1, { duration: 500 }));
    }, []);

    const vinStyle    = useAnimatedStyle(() => ({ opacity: vinOp.value,  transform: [{ translateY: vinY.value }] }));
    const rStyle      = useAnimatedStyle(() => ({ opacity: rOp.value,    transform: [{ translateX: rX.value   }] }));
    const streakStyle = useAnimatedStyle(() => ({ opacity: streakOp.value }));
    const uLineStyle  = useAnimatedStyle(() => ({ opacity: uLineOp.value, transform: [{ translateX: uLineX.value }] }));
    const logoStyle   = useAnimatedStyle(() => ({ opacity: logoOp.value }));
    const hudStyle    = useAnimatedStyle(() => ({ opacity: hudOp.value  }));
    const eyeStyle    = useAnimatedStyle(() => ({ opacity: eyeOp.value,  transform: [{ translateY: eyeY.value  }] }));
    const h1Style     = useAnimatedStyle(() => ({ opacity: h1Op.value,   transform: [{ translateY: h1Y.value   }], letterSpacing: h1Spc.value }));
    const h2Style     = useAnimatedStyle(() => ({ opacity: h2Op.value,   transform: [{ translateY: h2Y.value   }], letterSpacing: h2Spc.value }));
    const subStyle    = useAnimatedStyle(() => ({ opacity: subOp.value,  transform: [{ translateY: subY.value  }] }));
    const signInStyle = useAnimatedStyle(() => ({ opacity: signInOp.value }));
    const trustStyle  = useAnimatedStyle(() => ({ opacity: trustOp.value  }));

    return (
        <View style={s.container}>

            {/* ── Base gradient ── */}
            <LinearGradient
                colors={['#060510', '#0C0918', '#100E22', '#07050F']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
            />

            {/* ── 1. Warp field ── */}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={i} angleDeg={a} delay={i * 10} />
            ))}

            {/* ── Scan line ── */}
            <ScanLine />

            {/* ── HUD corners ── */}
            <Animated.View style={[StyleSheet.absoluteFill, hudStyle]} pointerEvents="none">
                <View style={s.hudFrame}>
                    <HudCorner pos="tl" /><HudCorner pos="tr" />
                    <HudCorner pos="bl" /><HudCorner pos="br" />
                </View>
            </Animated.View>

            {/* ── Aurora blobs ── */}
            <AmbientBlob color="rgba(212,175,55,0.07)" size={420} top={height * 0.05} left={-70}             delay={200} duration={5200} />
            <AmbientBlob color="rgba(110,70,220,0.09)"  size={350} top={height * 0.10} right={-90}            delay={500} duration={6400} />
            <AmbientBlob color="rgba(212,175,55,0.05)"  size={260} top={height * 0.54} left={width * 0.28}   delay={800} duration={4600} />
            <AmbientBlob color="rgba(40,90,210,0.07)"   size={300} top={height * 0.60} right={-60}           delay={300} duration={7800} />

            {/* ── Starfield ── */}
            <Particle x={width * 0.10} y={height * 0.18} r={2.5} delay={900}  />
            <Particle x={width * 0.82} y={height * 0.12} r={3}   delay={1200} />
            <Particle x={width * 0.64} y={height * 0.30} r={2}   delay={1500} />
            <Particle x={width * 0.22} y={height * 0.40} r={3}   delay={1800} />
            <Particle x={width * 0.90} y={height * 0.46} r={2}   delay={2100} />
            <Particle x={width * 0.44} y={height * 0.70} r={2}   delay={2400} color="rgba(160,110,255,0.9)" />
            <Particle x={width * 0.06} y={height * 0.58} r={2.5} delay={2700} color="rgba(160,110,255,0.9)" />
            <Particle x={width * 0.94} y={height * 0.26} r={2}   delay={3000} />

            {/* ── 2 + 3. Logo zone ── */}
            <Animated.View style={[s.logoZone, logoStyle]}>

                {/* 2. Gyroscope rings */}
                <OrbitRing size={164} duration={8000}  delay={900}  />
                <OrbitRing size={206} duration={13000} delay={1100} reverse />
                <OrbitRing size={250} duration={19000} delay={1300} />

                {/* Outer soft halo — large diffuse glow */}
                <View style={s.logoBedOuter} />

                {/* Inner glow bed */}
                <View style={s.logoBed} />

                {/* Inner static precision ring */}
                <View style={s.logoRingStatic} />

                {/* Cross hair accent — 4 tick marks at N/E/S/W */}
                <View style={[s.logoTick, { top: -18, left: '50%', marginLeft: -0.5 }]} />
                <View style={[s.logoTick, { bottom: -18, left: '50%', marginLeft: -0.5 }]} />
                <View style={[s.logoTick, { left: -18, top: '50%', marginTop: -0.5, width: 8, height: 1 }]} />
                <View style={[s.logoTick, { right: -18, top: '50%', marginTop: -0.5, width: 8, height: 1 }]} />

                {/* 3. vinR wordmark */}
                <View style={s.wordmarkWrap}>
                    {/* Underline sweep */}
                    <View style={s.uLineTrack} pointerEvents="none">
                        <Animated.View style={[s.uLineBeam, uLineStyle]}>
                            <LinearGradient
                                colors={['transparent', GOLD_BRIGHT, GOLD, 'transparent']}
                                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                                style={{ flex: 1, borderRadius: 1 }}
                            />
                        </Animated.View>
                    </View>

                    {/* "vin" */}
                    <Animated.Text style={[s.logoVin, vinStyle]}>vin</Animated.Text>

                    {/* "R" + comet streak (move together) */}
                    <Animated.View style={[s.rContainer, rStyle]}>
                        <Animated.View style={[s.cometStreak, streakStyle]} pointerEvents="none">
                            <LinearGradient
                                colors={[GOLD_BRIGHT, 'rgba(212,175,55,0.25)', 'transparent']}
                                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                                style={{ flex: 1, borderRadius: 1 }}
                            />
                        </Animated.View>
                        <Text style={s.logoR}>R</Text>
                    </Animated.View>
                </View>
            </Animated.View>

            {/* ── 4. Radar line ── */}
            <RadarLine delay={1200} />

            {/* ── 5. Headlines ── */}
            <View style={s.headlineBlock}>
                <Animated.View style={[s.eyebrowRow, eyeStyle]}>
                    <View style={s.eyebrowDot} />
                    <Text style={s.eyebrow}>EPIC COMEBACK</Text>
                    <View style={s.eyebrowDot} />
                </Animated.View>
                <Animated.Text style={[s.h1, h1Style]}>Win your</Animated.Text>
                <Animated.Text style={[s.h2, h2Style]}>life back.</Animated.Text>
                <Animated.Text style={[s.sub, subStyle]}>
                    The science-based system that rebuilds{'\n'}your habits, identity & momentum.
                </Animated.Text>
            </View>

            <View style={s.spacer} />

            {/* ── 6. Liquid CTA ── */}
            <LiquidCTA delay={2550} />

            {/* ── Sign in ── */}
            <Animated.View style={signInStyle}>
                <Pressable onPress={() => { haptics.light(); router.push('/(auth)/sign-in'); }}
                    style={s.signInRow} hitSlop={12}>
                    <Text style={s.signInBase}>Already winning?</Text>
                    <Text style={s.signInAccent}> Sign in</Text>
                </Pressable>
            </Animated.View>

            {/* ── Trust bar ── */}
            <Animated.View style={[s.trustBar, trustStyle]}>
                <TrustPill icon="⚡" label="Science-backed" />
                <View style={s.trustSep} />
                <TrustPill icon="✦"  label="AI-powered" />
                <View style={s.trustSep} />
                <TrustPill icon="◎"  label="21-day engine" />
            </Animated.View>

        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    scanWrap: {
        position: 'absolute',
        left: 0, right: 0, top: 0,
        zIndex: 0,
    },

    hudFrame: {
        position: 'absolute',
        top:    Platform.OS === 'ios' ? 58 : 44,
        left: 20, right: 20, bottom: 32,
    },
    hudCorner: {
        position: 'absolute',
        width: 16, height: 16,
        borderColor: 'rgba(212,175,55,0.2)',
    },

    // Logo
    logoZone: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    logoBedOuter: {
        position: 'absolute',
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(212,175,55,0.035)',
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 80,
    },
    logoBed: {
        position: 'absolute',
        width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(212,175,55,0.07)',
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 44,
    },
    logoRingStatic: {
        position: 'absolute',
        width: 118, height: 118, borderRadius: 59,
        borderWidth: 0.5,
        borderColor: 'rgba(212,175,55,0.3)',
    },
    logoTick: {
        position: 'absolute',
        width: 1,
        height: 8,
        backgroundColor: 'rgba(212,175,55,0.4)',
    },
    wordmarkWrap: {
        flexDirection: 'row',
        alignItems: 'baseline',
        position: 'relative',
    },
    uLineTrack: {
        position: 'absolute',
        bottom: -6, left: -8, right: -8,
        height: 1.5,
        overflow: 'hidden',
    },
    uLineBeam: {
        position: 'absolute',
        top: 0, bottom: 0,
        left: -60, width: 60,
    },
    logoVin: {
        fontFamily: 'DMSans_300Light',
        fontSize: 46,
        color: TEXT_HI,
        letterSpacing: -1,
        lineHeight: 54,
    },
    rContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        position: 'relative',
    },
    logoR: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 54,
        color: GOLD,
        letterSpacing: -1,
        lineHeight: 60,
        textShadowColor: 'rgba(212,175,55,0.55)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 16,
    },
    cometStreak: {
        position: 'absolute',
        left: '100%',
        top: '42%',
        width: 76, height: 2,
        marginLeft: 4,
    },

    // Radar
    radarWrap: {
        width: width - 56,
        height: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        position: 'relative',
    },
    radarLineLeft: {
        position: 'absolute',
        right: HALF_W + 2,
        top: 6.5, height: 0.5,
        backgroundColor: 'rgba(212,175,55,0.28)',
    },
    radarLineRight: {
        position: 'absolute',
        left: HALF_W + 2,
        top: 6.5, height: 0.5,
        backgroundColor: 'rgba(212,175,55,0.28)',
    },
    radarNode: {
        position: 'absolute',
        left: HALF_W - 2, top: 5,
        width: 4, height: 4, borderRadius: 2,
        backgroundColor: GOLD,
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1, shadowRadius: 6,
    },
    radarDot: {
        position: 'absolute',
        left: HALF_W + 2, top: 4,
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: GOLD_BRIGHT,
        shadowColor: GOLD_BRIGHT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1, shadowRadius: 5,
    },

    // Headline
    headlineBlock: { alignItems: 'center' },
    eyebrowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, marginBottom: 16,
    },
    eyebrowDot: {
        width: 3, height: 3, borderRadius: 1.5,
        backgroundColor: 'rgba(212,175,55,0.4)',
    },
    eyebrow: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 9.5,
        color: 'rgba(212,175,55,0.42)',
        letterSpacing: 3.5,
        textTransform: 'uppercase',
    },
    h1: {
        fontFamily: 'DMSans_300Light',
        fontSize: 52, lineHeight: 54,
        color: 'rgba(236,234,246,0.5)',
        textAlign: 'center',
    },
    h2: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 58, lineHeight: 60,
        color: TEXT_HI,
        textAlign: 'center',
        marginBottom: 20,
    },
    sub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15, lineHeight: 23,
        color: TEXT_MID,
        textAlign: 'center',
        letterSpacing: 0.1,
    },

    spacer: { height: 44 },

    // CTA
    ctaOuter: {
        width: CTA_W, height: 58,
        borderRadius: 16,
        marginBottom: 16,
    },
    ctaGlow: {
        borderRadius: 16,
        shadowColor: GOLD_BRIGHT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5, shadowRadius: 28,
        backgroundColor: 'transparent',
    },
    ctaBorder: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.42)',
    },
    ctaLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24, gap: 12,
    },
    ctaText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17, color: VOID,
        letterSpacing: 0.1, flex: 1,
    },
    ctaArrowCircle: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.13)',
        alignItems: 'center', justifyContent: 'center',
    },
    ctaArrow: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 22, color: VOID,
        lineHeight: 26, marginLeft: 1,
    },

    // Sign in
    signInRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingHorizontal: 16,
    },
    signInBase: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14.5, color: TEXT_LO,
    },
    signInAccent: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14.5, color: GOLD,
    },

    // Trust bar
    trustBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 46 : 30,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 18, paddingVertical: 9,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 28, borderWidth: 0.5,
        borderColor: 'rgba(236,234,246,0.07)',
    },
    trustPill: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, gap: 5,
    },
    trustIcon: {
        fontSize: 9,
        color: 'rgba(212,175,55,0.4)',
    },
    trustLabel: {
        fontFamily: 'DMSans_300Light',
        fontSize: 10, color: TEXT_LO,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    trustSep: {
        width: 0.5, height: 12,
        backgroundColor: 'rgba(236,234,246,0.07)',
    },
});