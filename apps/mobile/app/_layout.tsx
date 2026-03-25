import 'react-native-gesture-handler';
/**
 * Root Layout — App entry point with Clerk Auth + React Query + fonts
 */
import "../global.css";

import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreLogs(['SafeAreaView']);
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
import { colors } from '../constants/theme';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';
        
        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/welcome');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments]);

    return (
        <Stack
            screenOptions={({
            }) => ({
                headerShown: false,
                contentStyle: { backgroundColor: colors.void },
                animation: 'slide_from_right',
            })}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="notification-settings" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="therapist" />
            <Stack.Screen name="breathing" />
            <Stack.Screen name="yoga" />
            <Stack.Screen name="morning" />
            <Stack.Screen name="evening" />
            <Stack.Screen name="grounding" />
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

    // if (!fontsLoaded) {
    //     return null;
    // }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <QueryProvider>
                        <StatusBar style="auto" />
                        <RootNavigator />
                    </QueryProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
