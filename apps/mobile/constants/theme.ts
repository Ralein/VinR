/**
 * VinR Midnight Gold Design System Tokens
 */

export const colors = {
    // Backgrounds
    void: '#07090F',
    surface: '#0F1320',
    elevated: '#161C2E',

    // Brand
    gold: '#D4A853',
    goldLight: '#F0C96B',
    goldGlow: 'rgba(212,168,83,0.15)',

    // Semantic
    emerald: '#4ECBA0',
    sapphire: '#4A90D9',
    crimson: '#E85D5D',

    // Text
    textPrimary: '#EEF0F7',
    textMuted: '#7A8099',
    textGhost: '#3D4560',

    // Border
    border: 'rgba(255,255,255,0.07)',
    borderLight: 'rgba(255,255,255,0.12)',
} as const;

export const fonts = {
    display: 'PlayfairDisplay_700Bold',
    displayBlack: 'PlayfairDisplay_900Black',
    body: 'DMSans_400Regular',
    bodyLight: 'DMSans_300Light',
    bodySemiBold: 'DMSans_600SemiBold',
    italic: 'CormorantGaramond_300Light_Italic',
    mono: 'JetBrainsMono_400Regular',
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;

export const animation = {
    spring: {
        stiffness: 100,
        damping: 14,
    },
    stagger: 80,
    pressScale: 0.96,
} as const;

export type Theme = {
    colors: typeof colors;
    fonts: typeof fonts;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    animation: typeof animation;
};

export const theme: Theme = {
    colors,
    fonts,
    spacing,
    borderRadius,
    animation,
};
