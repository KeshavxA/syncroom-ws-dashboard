/**
 * Parse and validate incoming WS payloads.
 * @param {Object} message - Raw message from STOMP subscription
 * @returns {Object|null} Parsed data or null on error
 */
export const parseMessage = (message) => {
  if (!message || !message.body) {
    return null;
  }
  
  try {
    const data = JSON.parse(message.body);
    // TODO: Add shape validation if necessary
    return data;
  } catch (error) {
    console.error('Failed to parse WebSocket message:', error);
    return null;
  }
};
