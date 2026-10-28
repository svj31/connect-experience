"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "./api";
import { useLive } from "./live";
import { emitAck } from "./socket";
import type { ActivityId, ChatMessage, Reaction, RoomDetail, Snapshot } from "./types";

export interface FloatingReaction { id: number; kind: Reaction; mine: boolean; left: number }

/**
 * Everything a page needs to be "in" a room: details, chat, presence, the live game
 * snapshot and reactions, over the one shared socket. Rejoins after reconnects.
 */
export function useRoom(code: string | null, me: number | undefined, opts: { onMessage?: (m: ChatMessage) => void } = {}) {
  const { socket } = useLive();
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [pulse, setPulse] = useState({ me: 0, partner: 0 });
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessage = useRef(opts.onMessage);
  useEffect(() => {
    onMessage.current = opts.onMessage;
  }, [opts.onMessage]);

  const loadDetail = useCallback(async () => {
    if (!code) return;
    try {
      setDetail(await api<RoomDetail>(`/rooms/${code}`));
    } catch (e) {
      setFatal(errorMessage(e));
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;
    let active = true;
    // A new room starts from a clean slate before its data arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetail(null);
    setMessages([]);
    setSnapshot(null);
    setFatal(null);
    api<RoomDetail>(`/rooms/${code}`).then((d) => active && setDetail(d)).catch((e) => active && setFatal(errorMessage(e)));
    api<{ messages: ChatMessage[] }>(`/rooms/${code}/messages`).then((r) => active && setMessages(r.messages)).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [code]);

  useEffect(() => {
    if (!socket || !code || !me) return;
    const join = async () => {
      const res = await emitAck(socket, "room:join", code);
      if (!res.ok) setFatal(res.error ?? "Could not open this space");
      else setJoined(true);
    };
    if (socket.connected) void join();
    const onConnect = () => void join();
    const onDisconnect = () => setJoined(false);
    const onSnapshot = (s: Snapshot) => setSnapshot(s);
    const onChanged = () => void loadDetail();
    const onClosed = () => setFatal("This space has closed.");
    const onPresence = ({ online }: { online: number[] }) => setSnapshot((s) => (s ? { ...s, online } : { activity: "wyr" as ActivityId, game: null, online }));
    const onChat = (m: ChatMessage) => {
      setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
      if (m.userId !== me) setPartnerTyping(false);
      onMessage.current?.(m);
    };
    const onTyping = () => {
      setPartnerTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setPartnerTyping(false), 3000);
    };
    const onReaction = ({ kind, userId }: { kind: Reaction; userId: number }) => {
      const id = Date.now() + Math.random();
      const mine = userId === me;
      setReactions((prev) => [...prev.slice(-12), { id, kind, mine, left: (mine ? 10 : 55) + Math.random() * 30 }]);
      setPulse((p) => (mine ? { ...p, me: p.me + 1 } : { ...p, partner: p.partner + 1 }));
      setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 1900);
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:snapshot", onSnapshot);
    socket.on("room:changed", onChanged);
    socket.on("room:closed", onClosed);
    socket.on("presence", onPresence);
    socket.on("chat:message", onChat);
    socket.on("chat:typing", onTyping);
    socket.on("reaction", onReaction);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:snapshot", onSnapshot);
      socket.off("room:changed", onChanged);
      socket.off("room:closed", onClosed);
      socket.off("presence", onPresence);
      socket.off("chat:message", onChat);
      socket.off("chat:typing", onTyping);
      socket.off("reaction", onReaction);
      setJoined(false);
    };
  }, [socket, code, me, loadDetail]);

  const send = useCallback(
    async (body: string) => {
      if (!socket) return { error: "Reconnecting. Try again in a moment." };
      const res = await emitAck(socket, "chat:send", { body });
      return res.ok ? { tip: (res.tip as string | null) ?? null } : { error: res.error ?? "Could not send" };
    },
    [socket],
  );

  const act = useCallback(
    async (action: Record<string, unknown>) => {
      if (!socket || !snapshot) return { ok: false, error: "Reconnecting. Try again in a moment." };
      return emitAck(socket, "game:action", { activity: snapshot.activity, action });
    },
    [socket, snapshot],
  );

  const restart = useCallback(async () => (socket ? emitAck(socket, "game:restart") : { ok: false, error: "Reconnecting" }), [socket]);
  const switchActivity = useCallback(async (id: ActivityId) => (socket ? emitAck(socket, "room:activity", id) : { ok: false, error: "Reconnecting" }), [socket]);
  const typing = useCallback(() => socket?.emit("chat:typing"), [socket]);
  const react = useCallback((kind: Reaction) => socket?.emit("reaction", kind), [socket]);

  return { detail, messages, snapshot, fatal, joined, partnerTyping, reactions, pulse, loadDetail, send, act, restart, switchActivity, typing, react };
}
