import type { AddressInfo } from "node:net";
import request from "supertest";
import { io as connect, type Socket } from "socket.io-client";
import { openDb } from "../src/db.js";
import { buildServer } from "../src/server.js";

export function makeServer() {
  return buildServer(openDb(":memory:"), { rateLimits: false });
}

let counter = 0;

/** Signs up a fresh user and returns an agent that keeps their session cookie. */
export async function signup(app: Parameters<typeof request.agent>[0], name = "Tester") {
  const agent = request.agent(app);
  counter++;
  const email = `user${counter}-${Date.now()}@example.com`;
  const res = await agent.post("/api/auth/signup").send({
    email,
    password: "secret123",
    displayName: name,
    ageConfirmed: true,
    website: "",
    startedAt: Date.now() - 5000,
  });
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.user as { id: number; displayName: string }, email };
}

export async function listen(httpServer: ReturnType<typeof makeServer>["httpServer"]) {
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  return `http://localhost:${(httpServer.address() as AddressInfo).port}`;
}

export async function connectSocket(url: string, agent: ReturnType<typeof request.agent>): Promise<Socket> {
  const { body } = await agent.post("/api/auth/socket-ticket");
  const socket = connect(url, { auth: { ticket: body.ticket }, transports: ["websocket"], forceNew: true });
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("connect_error", reject);
  });
  return socket;
}

export function emitAck<T = { ok: boolean; error?: string }>(socket: Socket, event: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve) => socket.emit(event, ...args, resolve));
}

export function nextEvent<T = unknown>(socket: Socket, event: string, predicate: (payload: T) => boolean = () => true, timeout = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`timed out waiting for ${event}`));
    }, timeout);
    function handler(payload: T) {
      if (!predicate(payload)) return;
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(payload);
    }
    socket.on(event, handler);
  });
}
