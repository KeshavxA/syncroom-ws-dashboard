import { useState, useEffect } from 'react';
import { parseMessage } from '../utils/messageParser';

export const useBlockers = (subscribe, isConnected) => {
  const [blockers, setBlockers] = useState([]);

  useEffect(() => {
    if (!isConnected) return;

    const subscription = subscribe('/topic/blockers', (message) => {
      const data = parseMessage(message);
      if (data) {
        // Expecting { id, text, author, timestamp, resolved }
        setBlockers(prev => {
          if (data.resolved) {
            return prev.filter(b => b.id !== data.id);
          }
          // Avoid duplicates
          const exists = prev.find(b => b.id === data.id);
          if (exists) {
              return prev.map(b => b.id === data.id ? data : b);
          }
          return [data, ...prev].slice(0, 50); // Keep last 50 blockers
        });
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [subscribe, isConnected]);

  return blockers;
};
