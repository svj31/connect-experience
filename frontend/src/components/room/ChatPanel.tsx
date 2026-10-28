"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode, useId } from "react";
import { timeAgo } from "@/lib/labels";
import type { ChatMessage, Reaction } from "@/lib/types";
import { REACTIONS } from "@/lib/types";
import { Loader } from "../ui/Loader";
import { Icon } from "../ui/Icon";

const REACTION_LABELS: Record<Reaction, string> = { heart: "Send a heart", laugh: "Send a laugh", wow: "Send a wow", clap: "Send applause", fire: "Send fire" };

/** Mirrors the server's list. Unkind messages get a gentle second look before sending. */
const UNKIND = ["idiot", "stupid", "ugly", "loser", "shut up", "kill yourself", "kys", "send nudes", "nudes", "slut", "whore", "bitch", "bastard", "retard", "fat pig", "nobody likes you", "worthless"];
export const looksUnkind = (text: string) => UNKIND.some((w) => new RegExp(`(^|\\W)${w.replace(/ /g, "\\s+")}($|\\W)`, "i").test(text));

const ICEBREAKERS = [
  "What is something small that made your week better?",
  "Which place do you always recommend to friends?",
  "What are you weirdly good at?",
  "What song do you never skip?",
  "What did you want to be when you were ten?",
  "Which fictional world would you move to?",
  "What does a good day look like for you?",
  "What is the best meal you have had this year?",
];

export function ChatPanel({
  messages,
  me,
  partnerName,
  partnerTyping,
  disabled,
  loading,
  onSend,
  onTyping,
  onReact,
  header,
  extraPrompts = [],
}: {
  messages: ChatMessage[];
  me: number;
  partnerName: string;
  partnerTyping: boolean;
  disabled: boolean;
  loading?: boolean;
  onSend: (body: string) => Promise<{ error?: string; tip?: string | null }>;
  onTyping: () => void;
  onReact: (kind: Reaction) => void;
  header?: ReactNode;
  extraPrompts?: string[];
}) {
  // Unique per panel: a room can show the docked chat and the floating one at the same time.
  const inputId = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const lastTyping = useRef(0);
  const breakerIndex = useRef(-1);
  const prompts = [...extraPrompts, ...ICEBREAKERS];

  useEffect(() => {
    list.current?.scrollTo?.({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, partnerTyping]);

  async function deliver(body: string) {
    const res = await onSend(body);
    if (res.error) setError(res.error);
    else {
      setText("");
      setError(null);
      setNudge(false);
      setTip(res.tip ?? null);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    if (looksUnkind(body) && !nudge) {
      setNudge(true);
      return;
    }
    await deliver(body);
  }

  function icebreaker() {
    // Start somewhere random so two people do not always see the same first prompt.
    breakerIndex.current = breakerIndex.current < 0 ? Math.floor(Math.random() * Math.min(prompts.length, 3)) : (breakerIndex.current + 1) % prompts.length;
    setText(prompts[breakerIndex.current]);
  }

  return (
    <section aria-label={`Chat with ${partnerName}`} className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-line bg-surface">
      {header ?? (
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-display text-lg font-bold">Chat</h2>
        </header>
      )}

      <ol ref={list} className="flex-1 space-y-2 overflow-y-auto px-4 py-4" aria-live="polite" aria-relevant="additions">
        {loading ? (
          <li><Loader variant="chat" caption="Loading your conversation" size={72} /></li>
        ) : messages.length === 0 ? (
          <li className="flex flex-col items-center py-8 text-center text-sm text-muted">
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-soft text-violet"><Icon name="chat" /></span>
            No messages yet. Try an icebreaker below, or start an activity together.
          </li>
        ) : null}
        {messages.map((m, i) => {
          const mine = m.userId === me;
          const showTime = i === messages.length - 1 || messages[i + 1]?.userId !== m.userId;
          return (
            <li key={m.id} className={`flex animate-rise flex-col ${mine ? "items-end" : "items-start"}`}>
              <p className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[0.95rem] leading-snug break-words ${mine ? "rounded-br-md bg-brand" : "rounded-bl-md border border-line bg-paper text-ink"}`}>
                <span className="sr-only">{mine ? "You" : partnerName}: </span>
                {m.body}
              </p>
              {showTime && <span className="mt-0.5 px-1 text-[11px] text-muted">{timeAgo(m.createdAt)}</span>}
            </li>
          );
        })}
        {partnerTyping && (
          <li className="flex items-center gap-2 text-sm text-muted">
            <span className="flex gap-1 rounded-2xl border border-line bg-paper px-3 py-2.5" aria-hidden="true">
              {[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${d}ms` }} />)}
            </span>
            <span className="sr-only">{partnerName} is typing</span>
          </li>
        )}
      </ol>

      <div className="flex items-center gap-0.5 border-t border-line px-3 pt-2" aria-label="Reactions" role="group">
        {REACTIONS.map((r) => (
          <button key={r} disabled={disabled} onClick={() => onReact(r)} className="rounded-xl p-1.5 text-muted transition-all hover:-translate-y-0.5 hover:bg-rose-soft hover:text-rose disabled:opacity-40">
            <Icon name={r} size={19} label={REACTION_LABELS[r]} />
          </button>
        ))}
        <button type="button" onClick={icebreaker} disabled={disabled} className="ml-auto flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-violet hover:bg-violet-soft disabled:opacity-40">
          <Icon name="sparkle" size={16} /> Icebreaker
        </button>
      </div>

      <form onSubmit={submit} className="p-3 pt-2">
        {nudge && (
          <div role="alert" className="mb-2 rounded-2xl bg-sun-soft p-3 text-sm">
            <p className="font-semibold">Does this feel kind?</p>
            <p className="text-muted">Words land differently in text. You can rephrase, or send it anyway.</p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => setNudge(false)} className="rounded-lg bg-brand px-2.5 py-1 font-semibold text-on-primary">Rephrase</button>
              <button type="button" onClick={() => deliver(text.trim())} className="rounded-lg px-2.5 py-1 font-semibold text-muted hover:text-ink">Send anyway</button>
            </div>
          </div>
        )}
        {tip && !nudge && (
          <p className="mb-2 flex items-start gap-2 rounded-2xl bg-violet-soft p-2.5 text-sm">
            <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-violet" /> <span className="flex-1">{tip}</span>
            <button type="button" onClick={() => setTip(null)} className="text-muted hover:text-ink"><Icon name="close" size={14} label="Dismiss tip" /></button>
          </p>
        )}
        {error && <p role="alert" className="mb-2 text-sm font-medium text-danger">{error}</p>}
        <div className="flex gap-2">
          <label htmlFor={inputId} className="sr-only">Message</label>
          <input
            id={inputId}
            value={text}
            maxLength={500}
            disabled={disabled}
            autoComplete="off"
            onChange={(e) => {
              setText(e.target.value);
              setNudge(false);
              const now = Date.now();
              if (now - lastTyping.current > 2000) {
                lastTyping.current = now;
                onTyping();
              }
            }}
            placeholder={disabled ? "Chat opens when someone joins" : `Message ${partnerName}`}
            className="h-11 min-w-0 flex-1 rounded-2xl border border-transparent bg-paper-deep px-4 focus:border-violet focus:outline-none disabled:bg-paper"
          />
          <button type="submit" disabled={disabled || !text.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand transition-transform hover:scale-105 disabled:opacity-40">
            <Icon name="send" size={18} label="Send" />
          </button>
        </div>
      </form>
    </section>
  );
}
