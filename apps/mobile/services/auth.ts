import api from './api';
import { setItemAsync, getItemAsync, deleteItemAsync } from '../utils/storage';
import { useAuthStore } from '../stores/authStore';

export const AuthService = {
    async signIn(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        const { access_token } = response.data;
        await setItemAsync('authToken', access_token);
        useAuthStore.getState().setToken(access_token);
        
        // After getting token, we need to fetch user details
        const me = await this.getMe();
        return me;
    },

    async signUp(email: string, password: string, name?: string) {
        // Register user
        await api.post('/auth/register', { email, password, name });
        // After signup, automatically sign in to get the token
        return await this.signIn(email, password);
    },

    async getMe() {
        const response = await api.get('/auth/me');
        const user = response.data;
        useAuthStore.getState().setUser(user);
        return user;
    },

    async signOut() {
        await deleteItemAsync('authToken');
        useAuthStore.getState().signOut();
    },

    async initAuth() {
        try {
            const token = await getItemAsync('authToken');
            if (token) {
                useAuthStore.getState().setToken(token);
                await this.getMe();
            } else {
                useAuthStore.getState().setLoading(false);
            }
        } catch (error) {
            console.error('Failed to init auth:', error);
            await deleteItemAsync('authToken');
            useAuthStore.getState().signOut();
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    }
};
