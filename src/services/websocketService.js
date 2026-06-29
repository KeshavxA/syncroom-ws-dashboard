import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws';

class WebSocketService {
  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }

    this.client = null;
    this.status = 'disconnected';
    this.subscriptions = new Map();
    this.activeSubscriptions = new Map();
    this.reconnectAttempts = 0;
    this.baseReconnectDelay = 2000;
    this.maxReconnectDelay = 30000;
    this.onStatusChange = null;
    this.reconnectTimeout = null;

    WebSocketService.instance = this;
  }

  _updateStatus(newStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  _scheduleReconnect() {
    if (this.status === 'disconnected') return;
    this._updateStatus('reconnecting');
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    this.reconnectAttempts++;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      if (this.status !== 'disconnected') {
        this._connectClient();
      }
    }, delay);
  }

  _connectClient() {
    this.client = new Client({
      brokerURL: WS_URL.startsWith('http') ? undefined : WS_URL,
      webSocketFactory: WS_URL.startsWith('http') ? () => new SockJS(WS_URL) : undefined,
      reconnectDelay: 0,
      onConnect: () => {
        this.reconnectAttempts = 0;
        this._updateStatus('connected');

        this.subscriptions.forEach((callback, topic) => {
          const sub = this.client.subscribe(topic, callback);
          this.activeSubscriptions.set(topic, sub);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        this._updateStatus('error');
      },
      onWebSocketClose: () => {
        this.activeSubscriptions.clear();
        if (this.status !== 'disconnected') {
          this._scheduleReconnect();
        }
      },
    });

    this.client.activate();
  }

  connect(onStatusChange) {
    this.onStatusChange = onStatusChange;

    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }

    this._updateStatus('connecting');
    this._connectClient();
  }

  disconnect() {
    this._updateStatus('disconnected');
    this.subscriptions.clear();
    this.activeSubscriptions.clear();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribe(topic, callback) {
    this.subscriptions.set(topic, callback);

    if (this.status === 'connected' && this.client) {
      const sub = this.client.subscribe(topic, callback);
      this.activeSubscriptions.set(topic, sub);
    }

    return () => {
      this.subscriptions.delete(topic);
      const sub = this.activeSubscriptions.get(topic);
      if (sub) {
        sub.unsubscribe();
        this.activeSubscriptions.delete(topic);
      }
    };
  }

  publish(topic, body) {
    if (this.status === 'connected' && this.client) {
      this.client.publish({ destination: topic, body: JSON.stringify(body) });
    } else {
      console.warn('Cannot publish, WebSocket is not connected.');
    }
  }

  getStatus() {
    return this.status;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
