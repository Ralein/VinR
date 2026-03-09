/**
 * Push Notification Service
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications and store token on backend.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    // Android channel
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
