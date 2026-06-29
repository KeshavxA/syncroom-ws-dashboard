import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect({ url, onConnect, onError, onDisconnect }) {
    if (this.client && this.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        this.connected = true;
        if (onConnect) onConnect(frame);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        if (onError) onError(frame);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.connected = false;
        if (onError) onError(event);
      },
      onWebSocketClose: () => {
        this.connected = false;
        if (onDisconnect) onDisconnect();
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  subscribe(destination, callback) {
    if (this.client && this.connected) {
      return this.client.subscribe(destination, callback);
    }
    return { unsubscribe: () => {} };
  }

  publish(destination, body) {
    if (this.client && this.connected) {
      this.client.publish({ destination, body: JSON.stringify(body) });
    }
  }
}

export const wsService = new WebSocketService();
