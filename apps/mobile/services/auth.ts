import api from './api';
import { useAuthStore } from '../stores/authStore';
import { setItemAsync, deleteItemAsync, getItemAsync } from '../utils/storage';

export const AuthService = {
    async signIn(email: string, password: string) {
        useAuthStore.getState().setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            if (data.access_token) {
                await setItemAsync('authToken', data.access_token);
                await setItemAsync('refreshToken', data.refresh_token);
                useAuthStore.getState().setToken(data.access_token);
                
                // Get user profile
                return await this.getMe();
            }
        } catch (error: any) {
            if (error?.response?.status !== 401) {
                console.error('Sign in failed:', error);
            }
            throw error;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    },

    async signUp(email: string, password: string, name?: string) {
        useAuthStore.getState().setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { email, password, name });
            
            if (data.access_token) {
                await setItemAsync('authToken', data.access_token);
                await setItemAsync('refreshToken', data.refresh_token);
                useAuthStore.getState().setToken(data.access_token);
                
                // Get user profile
                return await this.getMe();
            }
        } catch (error: any) {
            if (error?.response?.status !== 401) {
                console.error('Sign up failed:', error);
            }
            throw error;
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    },

    async getMe() {
        try {
            const { data: user } = await api.get('/auth/me');
            if (user) {
                const mappedUser = {
                    id: user.id,
                    email: user.email || '',
                    name: user.name || null,
                    avatarUrl: user.avatar_url || null,
                    onboardingComplete: user.onboarding_complete ?? true,
                    musicGenre: user.music_genre || null,
                    timezone: user.timezone || "UTC"
                };
                useAuthStore.getState().setUser(mappedUser);
                return mappedUser;
            }
        } catch (error: any) {
            if (error?.response?.status !== 401) {
                console.error('Get me failed:', error);
            }
            return null;
        }
        return null;
    },

    async signOut() {
        useAuthStore.getState().setLoading(true);
        try {
            await deleteItemAsync('authToken');
            await deleteItemAsync('refreshToken');
            useAuthStore.getState().signOut();
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    },

    async initAuth() {
        useAuthStore.getState().setLoading(true);
        try {
            const token = await getItemAsync('authToken');
            if (token) {
                useAuthStore.getState().setToken(token);
                const user = await this.getMe();
                if (!user) {
                    await this.signOut();
                }
            } else {
                useAuthStore.getState().signOut();
            }
        } catch (error) {
            console.error('Failed to init auth:', error);
            useAuthStore.getState().signOut();
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    }
};
