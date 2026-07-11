import { useState, useEffect, useCallback, useRef } from 'react';
import { parseBlocker } from '../utils/messageParser';

export function useBlockers({ subscribe, meetingId }) {
  const [blockers, setBlockers] = useState([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!meetingId || !subscribe) return;

    const unsubscribe = subscribe(`/topic/meetings/${meetingId}/blockers`, (rawMsg) => {
      if (!isMounted.current) return;

      const b = parseBlocker(rawMsg);
      if (!b) return;

      setBlockers((prev) => {
        const arr = [b, ...prev];
        if (arr.length > 50) {
          return arr.slice(0, 50);
        }
        return arr;
      });
    });

    return () => {
      isMounted.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe, meetingId]);

  const resolveBlocker = useCallback((blockerId) => {
    setBlockers((prev) => prev.map((b) => 
      b.blockerId === blockerId ? { ...b, isResolved: true } : b
    ));
  }, []);

  return { blockers, resolveBlocker };
}
