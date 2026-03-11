/**
 * Push Notification Service — Registration, deep linking, and channels
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import api from './api';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and store token on backend.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    // Android channels
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('streaks', {
            name: 'Streak Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
        await Notifications.setNotificationChannelAsync('milestones', {
            name: 'Milestone Celebrations',
            importance: Notifications.AndroidImportance.HIGH,
        });
        await Notifications.setNotificationChannelAsync('journal', {
            name: 'Journal Reminders',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
        await Notifications.setNotificationChannelAsync('events', {
            name: 'Event Suggestions',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
        await Notifications.setNotificationChannelAsync('media', {
            name: 'Media Suggestions',
            importance: Notifications.AndroidImportance.LOW,
        });
    }

    // Check permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    // Get token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Register on backend
    try {
        await api.post('/notifications/register-token', {
            token,
            platform: Platform.OS,
        });
    } catch (error) {
        console.warn('Failed to register push token:', error);
    }

    return token;
}

/**
 * Handle deep linking when user taps a notification.
 * Routes to the appropriate screen based on notification data payload.
 */
export function setupNotificationDeepLinking(): () => void {
    // Handle taps on notifications when app is in the foreground or background
    const subscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            const data = response.notification.request.content.data;

            if (!data?.screen) return;

            switch (data.screen) {
                case 'journey':
                    router.push('/(tabs)/journey');
                    // If action is mark_complete, the journey screen will handle showing the sheet
                    break;

                case 'checkin':
                    router.push('/(tabs)/checkin');
                    break;

                case 'journal':
                    router.push('/(tabs)/journal');
                    break;

                case 'profile':
                    router.push('/(tabs)/profile');
                    break;

                default:
                    router.push('/(tabs)');
                    break;
            }
        }
    );

    return () => subscription.remove();
}

/**
 * Get the last notification response (for cold starts).
 */
export async function getInitialNotification() {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
        const data = response.notification.request.content.data;
        if (data?.screen) {
            return data;
        }
    }
    return null;
}
