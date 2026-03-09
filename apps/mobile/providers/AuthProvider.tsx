/**
 * Clerk Auth Provider for VinR
 *
 * Wraps the app with Clerk's authentication context.
 * Use CLERK_PUBLISHABLE_KEY from your Clerk dashboard.
 */

import React from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

/**
 * Secure token cache using expo-secure-store.
 * Clerk uses this to persist session tokens across app restarts.
 */
const tokenCache = {
    async getToken(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },
    async saveToken(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch {
            // SecureStore may fail on web
        }
    },
    async clearToken(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch {
            // Ignore
        }
    },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    if (!CLERK_PUBLISHABLE_KEY) {
        console.warn('⚠️ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    }

    return (
        <ClerkProvider
            publishableKey={CLERK_PUBLISHABLE_KEY}
            tokenCache={tokenCache}
        >
            <ClerkLoaded>
                {children}
            </ClerkLoaded>
        </ClerkProvider>
    );
}
