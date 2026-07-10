import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.status = 'disconnected';
    this.reconnectAttempts = 0;
    this.onStatusChange = null;
    this.activeSubscriptions = new Map();
    this.stompSubscriptions = new Map();
  }

  _setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      if (this.onStatusChange) {
        this.onStatusChange(newStatus);
      }
    }
  }

  _getReconnectDelay() {
    const delay = 2000 * Math.pow(2, this.reconnectAttempts);
    return Math.min(delay, 30000);
  }

  /**
   * Initiates the WebSocket connection.
   * @param {Function} onStatusChange - Callback when connection status changes
   */
  connect(onStatusChange) {
    if (this.status === 'connected' || this.status === 'connecting') {
      if (onStatusChange) this.onStatusChange = onStatusChange;
      return;
    }

    if (onStatusChange) {
      this.onStatusChange = onStatusChange;
    }

    this._setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws';
    const isHttp = wsUrl.startsWith('http');

    this.client = new Client({
      brokerURL: isHttp ? undefined : wsUrl,
      webSocketFactory: isHttp ? () => new SockJS(wsUrl) : undefined,
      reconnectDelay: this._getReconnectDelay(),
      onConnect: () => {
        this.reconnectAttempts = 0;
        this._setStatus('connected');

        for (const [topic, callback] of this.activeSubscriptions.entries()) {
          this._subscribeToStomp(topic, callback);
        }
      },
      onDisconnect: () => {
        this._setStatus('disconnected');
      },
      onWebSocketClose: () => {
        if (this.status !== 'disconnected') {
          this.reconnectAttempts++;
          this.client.reconnectDelay = this._getReconnectDelay();
          this._setStatus('reconnecting');
        }
      },
      onStompError: (frame) => {
        console.error('Broker threw an error: ' + frame.headers['message']);
        this._setStatus('error');
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.reconnectDelay = 0;
      this.client.deactivate();
      this.client = null;
    }
    this.activeSubscriptions.clear();
    this.stompSubscriptions.clear();
    this.reconnectAttempts = 0;
    this._setStatus('disconnected');
  }

  _subscribeToStomp(topic, callback) {
    if (!this.client || !this.client.connected) return;

    if (this.stompSubscriptions.has(topic)) {
      this.stompSubscriptions.get(topic).unsubscribe();
    }

    const sub = this.client.subscribe(topic, (msg) => {
      callback(msg.body);
    });
    this.stompSubscriptions.set(topic, sub);
  }

  /**
   * Unsubscribes from a specific STOMP topic.
   * @param {string} topic 
   */
  unsubscribe(topic) {
    if (this.stompSubscriptions.has(topic)) {
      this.stompSubscriptions.get(topic).unsubscribe();
      this.stompSubscriptions.delete(topic);
    }
    this.activeSubscriptions.delete(topic);
  }

  /**
   * Subscribes to a topic. If connected, delegates to STOMP immediately.
   * @param {string} topic 
   * @param {Function} callback 
   * @returns {Function} cleanup function to unsubscribe
   */
  subscribe(topic, callback) {
    this.activeSubscriptions.set(topic, callback);
    if (this.status === 'connected') {
      this._subscribeToStomp(topic, callback);
    }
    return () => this.unsubscribe(topic);
  }

  /**
   * Publishes a message to a topic.
   * @param {string} topic 
   * @param {any} body 
   */
  publish(topic, body) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: topic,
        body: typeof body === 'string' ? body : JSON.stringify(body)
      });
    } else {
      console.warn(`WS not connected, couldn't publish to ${topic}`);
    }
  }

  getStatus() {
    return this.status;
  }
}

export const websocketService = new WebSocketService();
