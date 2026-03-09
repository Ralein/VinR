/**
 * Root Layout — App entry point with providers and auth guard
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { QueryProvider } from '../providers/QueryProvider';
import { colors } from '../constants/theme';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        PlayfairDisplay_700Bold,
        PlayfairDisplay_900Black,
        DMSans_300Light,
        DMSans_400Regular,
        DMSans_600SemiBold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <QueryProvider>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.void },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </QueryProvider>
    );
}
