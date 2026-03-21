/**
 * Root Layout — App entry point with Clerk Auth + React Query + fonts
 */
import "../global.css";

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
import { useAuthStore } from '../stores/authStore';
import { AuthProvider } from '../providers/AuthProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../constants/theme';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.void },
                animation: 'slide_from_right',
            }}
        >
            {!isAuthenticated ? (
                <Stack.Screen name="(auth)" />
            ) : (
                <Stack.Screen name="(tabs)" />
            )}
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        PlayfairDisplay_700Bold,
        PlayfairDisplay_900Black,
        DMSans_300Light,
        DMSans_400Regular,
        DMSans_600SemiBold,
    });
    
    const isLoadingAuth = useAuthStore((state) => state.isLoading);

    useEffect(() => {
        if (fontsLoaded && !isLoadingAuth) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isLoadingAuth]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <QueryProvider>
                <StatusBar style="light" />
                <RootNavigator />
            </QueryProvider>
        </AuthProvider>
    );
}
