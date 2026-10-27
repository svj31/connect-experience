import { io, type Socket } from "socket.io-client";
import { api } from "./api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

/**
 * Opens a Socket.IO connection. The session cookie is httpOnly, so every connect
 * and reconnect first asks the API for a fresh short lived ticket.
 */
export function openSocket(): Socket {
  return io(SOCKET_URL, {
    auth: (cb) => {
      api<{ ticket: string }>("/auth/socket-ticket", { method: "POST" })
        .then(({ ticket }) => cb({ ticket }))
        .catch(() => cb({ ticket: "" }));
    },
    transports: ["websocket", "polling"],
  });
}

export type Ack = { ok: boolean; error?: string; [key: string]: unknown };

export function emitAck(s: Socket, event: string, ...args: unknown[]): Promise<Ack> {
  return new Promise((resolve) => {
    s.timeout(8000).emit(event, ...args, (err: Error | null, res: Ack) => {
      resolve(err ? { ok: false, error: "The connection is slow. Try again." } : res);
    });
  });
}
