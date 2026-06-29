// better to return null than crash the whole feed

export function parseParticipantUpdate(rawMsg) {
  try {
    const data = JSON.parse(rawMsg);
    if (data && data.userId && data.name && data.status && data.meetingId) {
      if (['joined', 'left', 'idle'].includes(data.status)) {
        return data;
      }
    }
    return null;
  } catch (err) {
    console.warn('Failed to parse participant update', err);
    return null;
  }
}

export function parseMeetingUpdate(rawMsg) {
  try {
    const data = JSON.parse(rawMsg);
    if (data && data.meetingId && data.title && data.status && data.startTime && data.participantCount !== undefined) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to parse meeting update', err);
    return null;
  }
}

export function parseBlocker(rawMsg) {
  try {
    const data = JSON.parse(rawMsg);
    if (data && data.blockerId && data.reportedBy && data.description && data.meetingId && data.severity) {
      if (['low', 'medium', 'high'].includes(data.severity)) {
        return data;
      }
    }
    return null;
  } catch (err) {
    console.warn('Failed to parse blocker', err);
    return null;
  }
}
