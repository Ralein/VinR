/**
 * useEvents — TanStack Query hooks for event search and bookmarks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// --- Types ---

export interface EventResult {
    event_id: string;
    name: string;
    description: string | null;
    venue: string | null;
    address: string | null;
    date: string | null;
    start_time: string | null;
    category: string | null;
    distance_miles: number | null;
    url: string | null;
    is_virtual: boolean;
    image_url: string | null;
}

export interface EventSearchResponse {
    events: EventResult[];
    total: number;
    cached: boolean;
}

export interface EventBookmark {
    id: string;
    user_id: string;
    event_id: string;
    event_data: Record<string, any>;
    created_at: string;
}

// --- Hooks ---

/** Search for nearby wellness events */
export function useEventSearch(lat: number | null, lon: number | null, emotion?: string) {
    return useQuery<EventSearchResponse>({
        queryKey: ['events-search', lat, lon, emotion],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (lat !== null) params.set('lat', lat.toString());
            if (lon !== null) params.set('lon', lon.toString());
            if (emotion) params.set('emotion', emotion);
            const { data } = await api.get(`/events?${params.toString()}`);
            return data;
        },
        enabled: lat !== null && lon !== null,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

/** Get user's bookmarked events */
export function useEventBookmarks() {
    return useQuery<EventBookmark[]>({
        queryKey: ['event-bookmarks'],
        queryFn: async () => {
            const { data } = await api.get('/events/bookmarks');
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

/** Bookmark an event */
export function useBookmarkEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: EventResult) => {
            const { data } = await api.post('/events/bookmark', {
                event_id: event.event_id,
                event_data: event,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-bookmarks'] });
        },
    });
}

/** Remove a bookmark */
export function useRemoveBookmark() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventId: string) => {
            await api.delete(`/events/bookmark/${eventId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-bookmarks'] });
        },
    });
}
