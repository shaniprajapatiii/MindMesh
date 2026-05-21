import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });
  }
  return socket;
}

export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}