import { useReducer, useEffect, useMemo, useRef } from 'react';
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!meetingId || !subscribe) return;

    const unsubscribe = subscribe(`/topic/meetings/${meetingId}/participants`, (rawMsg) => {

      if (!isMounted.current) return;

      const update = parseParticipantUpdate(rawMsg);
      if (!update) return;

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

  }, [subscribe]);

  return useMemo(() => Array.from(participants.values()), [participants]);
}
