import { io } from 'socket.io-client';
import { API_URL } from './api';

export const createSocket = () =>
  io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 15000,
  });
