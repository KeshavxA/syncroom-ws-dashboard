import { useState, useEffect, useCallback } from 'react';
import { parseBlocker } from '../utils/messageParser';

export function useBlockers({ subscribe, meetingId }) {
  const [blockers, setBlockers] = useState([]);

  useEffect(() => {
    if (!meetingId || !subscribe) return;

    // cap at 50 so we don't eat memory on long meetings
    const unsubscribe = subscribe(`/topic/meetings/${meetingId}/blockers`, (rawMsg) => {
      const blocker = parseBlocker(rawMsg);
      if (!blocker) return;

      setBlockers((prev) => {
        const newBlockers = [blocker, ...prev];
        if (newBlockers.length > 50) {
          return newBlockers.slice(0, 50);
        }
        return newBlockers;
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe, meetingId]);

  const dismissBlocker = useCallback((blockerId) => {
    setBlockers((prev) => prev.filter((b) => b.blockerId !== blockerId));
  }, []);

  return { blockers, dismissBlocker };
}
