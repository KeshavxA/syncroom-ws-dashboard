/**
 * Parses a raw websocket message payload into a participant update object.
 * Returns null if the payload is malformed or invalid instead of throwing.
 * 
 * @param {string} rawMsg - The raw JSON string from the STOMP message body
 * @returns {Object|null} The parsed participant update or null
 */
export function parseParticipantUpdate(rawMsg) {
  try {
    const data = JSON.parse(rawMsg);
    if (data && data.userId && data.name && data.status && data.meetingId) {
      if (['joined', 'left', 'idle'].includes(data.status)) {
        return data;
      }
    }
    console.warn('WS parse failed for participant update, skipping payload');
    return null;
  } catch (err) {
    console.warn('WS JSON parse threw an error, skipping', err.message);
    return null;
  }
}

/**
 * Parses a raw websocket message payload into a meeting update object.
 * 
 * @param {string} rawMsg - The raw JSON string
 * @returns {Object|null}
 */
export function parseMeetingUpdate(rawMsg) {
  try {
    const data = JSON.parse(rawMsg);
    if (data && data.meetingId && data.title && data.status && data.startTime && data.participantCount !== undefined) {
      return data;
    }
    console.warn('WS parse failed for meeting update, skipping payload');
    return null;
  } catch (err) {
    console.warn('WS JSON parse threw an error, skipping', err.message);
    return null;
  }
}

/**
 * Parses a raw websocket message payload into a blocker notification object.
 * 
 * @param {string} rawMsg - The raw JSON string
 * @returns {Object|null}
 */
export function parseBlocker(rawMsg) {
  try {
    const data = JSON.parse(rawMsg);
    if (data && data.blockerId && data.reportedBy && data.description && data.meetingId && data.severity) {
      if (['low', 'medium', 'high'].includes(data.severity)) {
        return data;
      }
    }
    console.warn('WS parse failed for blocker, skipping payload');
    return null;
  } catch (err) {
    console.warn('WS JSON parse threw an error, skipping', err.message);
    return null;
  }
}
