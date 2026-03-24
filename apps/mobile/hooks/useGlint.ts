import { useState, useCallback } from 'react';
import api from '../services/api';

export interface Glint {
  video_id: string;
  title: string;
  channel: string;
  thumbnail_url: string;
}

export const useGlint = () => {
  const [glints, setGlints] = useState<Glint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGlints = useCallback(async (primaryReason: string = 'Stress Relief') => {
    setLoading(true);
    setError(null);
    try {
      // Assuming backend endpoint is updated to /media/glint or we use an alias
      const response = await api.get('/media/glint', {
        params: { primary_reason: primaryReason },
      });
      if (response.data && response.data.glints) {
        setGlints(response.data.glints);
      }
    } catch (err: any) {
      console.error('Failed to fetch glints:', err);
      setError('Failed to load glints.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    glints,
    loading,
    error,
    fetchGlints,
  };
};
