import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocketClient>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocketClient, request) => {
      console.log('New WebSocket connection established');
      
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established'
      }));
    });
  }

  private async handleMessage(ws: WebSocketClient, data: any) {
    switch (data.type) {
      case 'authenticate':
        await this.authenticateClient(ws, data.userId);
        break;
      case 'join_room':
        this.joinRoom(ws, data.room);
        break;
      case 'leave_room':
        this.leaveRoom(ws, data.room);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  private async authenticateClient(ws: WebSocketClient, userId: string) {
    try {
      // Verify user exists in database
      const user = await storage.getUser(parseInt(userId));
      if (user) {
        ws.userId = userId;
        this.addClient(userId, ws);
        ws.send(JSON.stringify({
          type: 'authenticated',
          userId: userId
        }));
        console.log(`User ${userId} authenticated via WebSocket`);
      } else {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Authentication failed'
        }));
      }
    } catch (error) {
      console.error('Authentication error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication failed'
      }));
    }
  }

  private addClient(userId: string, ws: WebSocketClient) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);
  }

  private removeClient(ws: WebSocketClient) {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }
  }

  private joinRoom(ws: WebSocketClient, room: string) {
    // Implementation for room-based messaging
    ws.send(JSON.stringify({
      type: 'joined_room',
      room: room
    }));
  }

  private leaveRoom(ws: WebSocketClient, room: string) {
    // Implementation for leaving rooms
    ws.send(JSON.stringify({
      type: 'left_room',
      room: room
    }));
  }

  private startHeartbeat() {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (ws.isAlive === false) {
          this.removeClient(ws);
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 second heartbeat

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  // Broadcast message to specific user
  public sendToUser(userId: string, message: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const messageStr = JSON.stringify(message);
      userClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  // Broadcast message to all connected clients
  public broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  // Send notification about tender updates
  public notifyTenderUpdate(tenderId: number, type: string, data: any) {
    this.broadcast({
      type: 'tender_update',
      tenderId,
      updateType: type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification about task updates
  public notifyTaskUpdate(taskId: number, type: string, data: any) {
    this.broadcast({
      type: 'task_update',
      taskId,
      updateType: type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification about document updates
  public notifyDocumentUpdate(documentId: number, type: string, data: any) {
    this.broadcast({
      type: 'document_update',
      documentId,
      updateType: type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Send system alerts
  public sendSystemAlert(level: 'info' | 'warning' | 'error', message: string, details?: any) {
    this.broadcast({
      type: 'system_alert',
      level,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.clients.size;
  }

  // Get all connected user IDs
  public getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: Server): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
    console.log('WebSocket server initialized');
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}