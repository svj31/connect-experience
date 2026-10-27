"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage, Reaction } from "@/lib/types";
import { REACTIONS } from "@/lib/types";
import { Icon } from "../ui/Icon";

const REACTION_LABELS: Record<Reaction, string> = { heart: "Send a heart", laugh: "Send a laugh", wow: "Send a wow", clap: "Send applause", fire: "Send fire" };

export function ChatPanel({
  messages,
  me,
  partnerName,
  partnerTyping,
  icebreakers,
  disabled,
  onSend,
  onTyping,
  onReact,
}: {
  messages: ChatMessage[];
  me: number;
  partnerName: string;
  partnerTyping: boolean;
  icebreakers: string[];
  disabled: boolean;
  onSend: (body: string) => Promise<string | null>;
  onTyping: () => void;
  onReact: (kind: Reaction) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const lastTyping = useRef(0);
  const breakerIndex = useRef(-1);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, partnerTyping]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    const err = await onSend(body);
    if (err) setError(err);
    else {
      setText("");
      setError(null);
    }
  }

  function icebreaker() {
    if (!icebreakers.length) return;
    // Start somewhere random so two people do not always see the same first prompt.
    breakerIndex.current = breakerIndex.current < 0 ? Math.floor(Math.random() * icebreakers.length) : (breakerIndex.current + 1) % icebreakers.length;
    setText(icebreakers[breakerIndex.current]);
  }

  return (
    <section aria-label="Chat" className="flex h-full min-h-0 flex-col rounded-lg border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-semibold">Chat</h2>
        <div className="flex gap-0.5" aria-label="Reactions">
          {REACTIONS.map((r) => (
            <button
              key={r}
              disabled={disabled}
              onClick={() => onReact(r)}
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-paper-deep hover:text-coral disabled:opacity-40"
            >
              <Icon name={r} size={18} label={REACTION_LABELS[r]} />
            </button>
          ))}
        </div>
      </header>

      <ol ref={list} className="flex-1 space-y-2 overflow-y-auto px-4 py-3" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 && (
          <li className="py-6 text-center text-sm text-muted">
            No messages yet. Play something first, or try an icebreaker.
          </li>
        )}
        {messages.map((m) => {
          const mine = m.userId === me;
          return (
            <li key={m.id} className={`flex animate-rise ${mine ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[0.95rem] leading-snug break-words ${mine ? "bg-ink text-white" : "border border-line bg-paper text-ink"}`}
              >
                <span className="sr-only">{mine ? "You" : partnerName}: </span>
                {m.body}
              </p>
            </li>
          );
        })}
        {partnerTyping && <li className="text-sm text-muted italic">{partnerName} is typing</li>}
      </ol>

      <form onSubmit={submit} className="border-t border-line p-3">
        {error && <p role="alert" className="mb-2 text-sm font-medium text-coral-dark">{error}</p>}
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <input
            id="chat-input"
            value={text}
            maxLength={500}
            disabled={disabled}
            onChange={(e) => {
              setText(e.target.value);
              const now = Date.now();
              if (now - lastTyping.current > 2000) {
                lastTyping.current = now;
                onTyping();
              }
            }}
            placeholder={disabled ? "Chat opens when someone joins" : "Write a message"}
            className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3 focus:border-teal focus:outline-none disabled:bg-paper"
          />
          <button type="submit" disabled={disabled || !text.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ink text-white disabled:opacity-40">
            <Icon name="send" size={18} label="Send" />
          </button>
        </div>
        <button type="button" onClick={icebreaker} disabled={disabled} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-teal hover:text-teal-dark disabled:opacity-40">
          <Icon name="sparkle" size={16} /> Suggest an icebreaker
        </button>
      </form>
    </section>
  );
}
