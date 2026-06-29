import { useState, useEffect } from 'react';
import { parseMessage } from '../utils/messageParser';

export const useParticipants = (subscribe, isConnected) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!isConnected) return;

    const subscription = subscribe('/topic/participants', (message) => {
      const data = parseMessage(message);
      if (data) {
        // Expecting { type: 'JOIN' | 'LEAVE' | 'SYNC', user: { id, name, avatar, status } }
        setParticipants(prev => {
          if (data.type === 'SYNC') return data.users;
          if (data.type === 'JOIN') {
            const exists = prev.find(p => p.id === data.user.id);
            return exists ? prev : [...prev, data.user];
          }
          if (data.type === 'LEAVE') {
            return prev.filter(p => p.id !== data.user.id);
          }
          if (data.type === 'UPDATE') {
            return prev.map(p => p.id === data.user.id ? { ...p, ...data.user } : p);
          }
          return prev;
        });
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [subscribe, isConnected]);

  return participants;
};
