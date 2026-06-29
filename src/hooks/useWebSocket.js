import { useState, useEffect, useCallback } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = () => {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    websocketService.connect(setStatus);

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const subscribe = useCallback((topic, callback) => {
    return websocketService.subscribe(topic, callback);
  }, []);

  const publish = useCallback((topic, body) => {
    websocketService.publish(topic, body);
  }, []);

  return { status, subscribe, publish };
};
