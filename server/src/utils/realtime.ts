import { Response } from 'express';

const sseClients = new Set<Response>();

/**
 * Register a new connected client for Server-Sent Events (SSE)
 */
export const addSSEClient = (res: Response) => {
  sseClients.add(res);

  // Remove client when connection is closed
  res.on('close', () => {
    sseClients.delete(res);
  });
};

/**
 * Broadcast an event to all actively connected SSE clients
 */
export const sendRealtimeEvent = (type: string, payload: any = {}) => {
  const eventPayload = JSON.stringify({
    type,
    payload,
    timestamp: Date.now()
  });

  const formattedMsg = `data: ${eventPayload}\n\n`;

  sseClients.forEach((client) => {
    try {
      client.write(formattedMsg);
    } catch (err) {
      sseClients.delete(client);
    }
  });
};

/**
 * Get count of active realtime SSE connections
 */
export const getConnectedClientsCount = (): number => {
  return sseClients.size;
};
