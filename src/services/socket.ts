import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string): void {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: {
                token,
            },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string, callback?: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event: string, data: any): void {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export default new SocketService();
