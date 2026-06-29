import { useEffect, useReducer, useMemo } from 'react';
import { parseParticipantUpdate } from '../utils/messageParser';

const participantReducer = (state, action) => {
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
};

export const useParticipants = ({ subscribe, meetingId }) => {
  const [participants, dispatch] = useReducer(participantReducer, new Map());

  useEffect(() => {
    if (!meetingId) return;

    const unsubscribe = subscribe(`/topic/meetings/${meetingId}/participants`, (rawMsg) => {
      const parsed = parseParticipantUpdate(rawMsg);
      if (!parsed) return;

      if (parsed.status === 'left') {
        dispatch({ type: 'REMOVE', payload: parsed });
      } else {
        dispatch({ type: 'UPDATE', payload: parsed });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [subscribe, meetingId]);

  return useMemo(() => Array.from(participants.values()), [participants]);
};
