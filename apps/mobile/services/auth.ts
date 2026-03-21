import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export const AuthService = {
    async signIn(email: string, password: string) {
        useAuthStore.getState().setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            useAuthStore.getState().setLoading(false);
            throw error;
        }

        if (data.session) {
            useAuthStore.getState().setToken(data.session.access_token);
            useAuthStore.getState().setUser({
                id: data.user.id,
                email: data.user.email || '',
                name: data.user.user_metadata?.name || null,
                avatarUrl: data.user.user_metadata?.avatarUrl || null,
                onboardingComplete: true,
                musicGenre: null,
                timezone: "UTC"
            });
        }
        useAuthStore.getState().setLoading(false);
        return data.user;
    },

    async signUp(email: string, password: string, name?: string) {
        useAuthStore.getState().setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) {
            useAuthStore.getState().setLoading(false);
            throw error;
        }

        if (data.session) {
            useAuthStore.getState().setToken(data.session.access_token);
            useAuthStore.getState().setUser({
                id: data.user!.id,
                email: data.user!.email || '',
                name: data.user!.user_metadata?.name || null,
                avatarUrl: data.user!.user_metadata?.avatarUrl || null,
                onboardingComplete: true,
                musicGenre: null,
                timezone: "UTC"
            });
        }
        useAuthStore.getState().setLoading(false);
        return data.user;
    },

    async getMe() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const mappedUser = {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name || null,
                avatarUrl: user.user_metadata?.avatarUrl || null,
                onboardingComplete: true,
                musicGenre: null,
                timezone: "UTC"
            };
            useAuthStore.getState().setUser(mappedUser);
            return mappedUser;
        }
        return null;
    },

    async signOut() {
        useAuthStore.getState().setLoading(true);
        await supabase.auth.signOut();
        useAuthStore.getState().signOut();
        useAuthStore.getState().setLoading(false);
    },

    async initAuth() {
        useAuthStore.getState().setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                useAuthStore.getState().setToken(session.access_token);
                await this.getMe();
            } else {
                useAuthStore.getState().signOut();
            }

            // Listen for auth state changes
            supabase.auth.onAuthStateChange(async (_event, newSession) => {
                if (newSession) {
                    useAuthStore.getState().setToken(newSession.access_token);
                    const mappedUser = {
                        id: newSession.user.id,
                        email: newSession.user.email || '',
                        name: newSession.user.user_metadata?.name || null,
                        avatarUrl: newSession.user.user_metadata?.avatarUrl || null,
                        onboardingComplete: true,
                        musicGenre: null,
                        timezone: "UTC"
                    };
                    useAuthStore.getState().setUser(mappedUser);
                } else {
                    useAuthStore.getState().signOut();
                }
            });
        } catch (error) {
            console.error('Failed to init auth:', error);
            useAuthStore.getState().signOut();
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    }
};
