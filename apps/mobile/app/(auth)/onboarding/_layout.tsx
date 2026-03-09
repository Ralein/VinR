/**
 * Onboarding Layout — 4-step flow
 */

import { Stack } from 'expo-router';
import { colors } from '../../../constants/theme';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.void },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="step1-name" />
            <Stack.Screen name="step2-mood" />
            <Stack.Screen name="step3-music" />
            <Stack.Screen name="step4-notify" />
        </Stack>
    );
}
