import { useReducer, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { parseParticipantUpdate } from '../utils/messageParser';

function participantsReducer(state, action) {
  switch (action.type) {
    case 'UPDATE': {
      const newState = new Map(state);
      newState.set(action.payload.userId, action.payload);
      return newState;
    }
    case 'REMOVE': {
      const newState = new Map(state);
      newState.delete(action.payload.userId);
      return newState;
    }
    case 'RESET':
      return new Map();
    default:
      return state;
  }
}

export function useParticipants({ subscribe, meetingId }) {
  const [participants, dispatch] = useReducer(participantsReducer, new Map());
  const participantsRef = useRef(participants);
  const isMounted = useRef(true);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    isMounted.current = true;
    if (!meetingId || !subscribe) return;

    const unsubscribe = subscribe(`/topic/meetings/${meetingId}/participants`, (rawMsg) => {

      if (!isMounted.current) return;

      const update = parseParticipantUpdate(rawMsg);
      if (!update) return;

      const prev = participantsRef.current.get(update.userId);
      const prevStatus = prev ? prev.status : null;

      if (update.status === 'joined' && prevStatus !== 'joined') {
        toast.success(`${update.name} joined the meeting`, {
          id: `${update.userId}-joined`,
        });
      } else if (update.status === 'left' && prevStatus !== 'left' && prev) {
        toast(`${update.name} left the meeting`, {
          icon: '👋',
          id: `${update.userId}-left`,
        });
      }

      if (update.status === 'left') {
        dispatch({ type: 'REMOVE', payload: update });
      } else {
        dispatch({ type: 'UPDATE', payload: update });
      }
    });

    return () => {
      isMounted.current = false;
      if (unsubscribe) unsubscribe();
      dispatch({ type: 'RESET' });
    };

  }, [subscribe, meetingId]);

  return useMemo(() => Array.from(participants.values()), [participants]);
}
