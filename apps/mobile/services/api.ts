/**
 * API Client — Axios instance with auth interceptors
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../constants/config';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('authToken');
            useAuthStore.getState().signOut();
        }
        return Promise.reject(error);
    }
);

export default api;
