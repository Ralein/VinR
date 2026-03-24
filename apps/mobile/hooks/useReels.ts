import { useState, useCallback } from 'react';
import api from '../services/api';

export interface Reel {
  video_id: string;
  title: string;
  channel: string;
  thumbnail_url: string;
}

export const useReels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = useCallback(async (primaryReason: string = 'Stress Relief') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/media/reels', {
        params: { primary_reason: primaryReason },
      });
      if (response.data && response.data.reels) {
        setReels(response.data.reels);
      }
    } catch (err: any) {
      console.error('Failed to fetch reels:', err);
      setError('Failed to load reels.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reels,
    loading,
    error,
    fetchReels,
  };
};
