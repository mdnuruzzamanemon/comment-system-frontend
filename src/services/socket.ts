import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string): void {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        console.log('Connecting to Socket.io...', import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'], // Try both transports
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully! ID:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        // Log all incoming events for debugging
        this.socket.onAny((eventName, ...args) => {
            console.log('📨 Socket event received:', eventName, args);
        });
    }

    disconnect(): void {
        if (this.socket) {
            console.log('Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (...args: any[]) => void): void {
        if (this.socket) {
            console.log('👂 Listening for event:', event);
            this.socket.on(event, callback);
        } else {
            console.warn('⚠️ Cannot listen to event, socket not connected:', event);
        }
    }

    off(event: string, callback?: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event: string, data: any): void {
        if (this.socket) {
            console.log('📤 Emitting event:', event, data);
            this.socket.emit(event, data);
        } else {
            console.warn('⚠️ Cannot emit event, socket not connected:', event);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export default new SocketService();
