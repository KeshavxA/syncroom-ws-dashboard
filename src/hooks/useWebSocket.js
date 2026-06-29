import { useState, useEffect, useCallback } from 'react';
import { wsService } from '../services/websocketService';

export const useWebSocket = (url) => {
  const [status, setStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus('connecting');
    wsService.connect({
      url,
      onConnect: () => {
        setStatus('connected');
        setError(null);
      },
      onError: (err) => {
        setStatus('error');
        setError(err?.headers?.message || 'Connection error');
      },
      onDisconnect: () => {
        setStatus('disconnected');
      }
    });

    return () => {
      wsService.disconnect();
    };
  }, [url]);

  const subscribe = useCallback((destination, callback) => {
    return wsService.subscribe(destination, callback);
  }, []);

  const publish = useCallback((destination, body) => {
    wsService.publish(destination, body);
  }, []);

  return { status, error, subscribe, publish };
};
