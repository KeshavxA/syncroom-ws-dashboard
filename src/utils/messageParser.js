export const parseParticipantUpdate = (rawMsg) => {
  try {
    const data = JSON.parse(rawMsg.body);
    if (data.userId && data.name && data.status && data.meetingId) {
      if (['joined', 'left', 'idle'].includes(data.status)) {
        return data;
      }
    }
    console.warn('Invalid participant update payload', data);
    return null;
  } catch (error) {
    console.warn('Failed to parse participant update', error);
    return null;
  }
};

export const parseMeetingUpdate = (rawMsg) => {
  try {
    const data = JSON.parse(rawMsg.body);
    if (
      data.meetingId &&
      data.title &&
      data.status &&
      data.startTime &&
      data.participantCount !== undefined
    ) {
      return data;
    }
    console.warn('Invalid meeting update payload', data);
    return null;
  } catch (error) {
    console.warn('Failed to parse meeting update', error);
    return null;
  }
};

export const parseBlocker = (rawMsg) => {
  try {
    const data = JSON.parse(rawMsg.body);
    if (
      data.blockerId &&
      data.reportedBy &&
      data.description &&
      data.meetingId &&
      data.severity
    ) {
      if (['low', 'medium', 'high'].includes(data.severity)) {
        return data;
      }
    }
    console.warn('Invalid blocker payload', data);
    return null;
  } catch (error) {
    console.warn('Failed to parse blocker', error);
    return null;
  }
};
