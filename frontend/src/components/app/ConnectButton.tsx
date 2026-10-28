"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { useLive } from "@/lib/live";
import type { AvatarConfig } from "@/lib/types";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/Field";
import { Icon } from "../ui/Icon";
import { Modal } from "../ui/Modal";

const OPENERS = ["Your prompt made me smile. Tell me more?", "Want to play Would You Rather sometime?", "We like the same things. Deep Talk or Connect Four?"];

/**
 * Sends a connection request with an optional note, like commenting on a prompt.
 * If they already asked you, it becomes a mutual match straight away.
 */
export function ConnectButton({ person, onDone, size = "md", prompt }: { person: { id: number; displayName: string; avatar?: Partial<AvatarConfig> }; onDone?: (status: "pending" | "accepted") => void; size?: "sm" | "md"; prompt?: string }) {
  const router = useRouter();
  const { celebrate, toast } = useLive();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ status: "pending" | "accepted"; mutual: boolean; roomCode?: string }>("/connections", { body: { userId: person.id, note } });
      setOpen(false);
      track("connect_request");
      if (res.mutual && res.roomCode) {
        const code = res.roomCode;
        celebrate({ title: "It's a Saath!", message: `You and ${person.displayName} both reached out. Your shared space is open.`, them: { name: person.displayName, avatar: person.avatar }, href: `/app/room/${code}`, cta: "Say hello" });
      } else {
        toast("Request sent", `${person.displayName} will see it in their Connections.`);
      }
      onDone?.(res.status);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        <Icon name="heart" size={size === "sm" ? 16 : 18} /> Connect
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Connect with ${person.displayName}`}>
        {prompt && <p className="mb-3 rounded-2xl bg-paper-deep p-3 text-sm"><span className="font-bold">Replying to:</span> {prompt}</p>}
        <TextArea label="Add a note (optional)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} hint="A line about their prompt or an activity idea gets more replies than a plain request." />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {OPENERS.map((o) => (
            <button key={o} type="button" onClick={() => setNote(o)} className="rounded-lg border border-line-strong px-2 py-1 text-xs font-semibold hover:border-violet hover:text-violet">{o}</button>
          ))}
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-medium text-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={send} loading={busy}><Icon name="send" size={16} /> Send request</Button>
        </div>
      </Modal>
    </>
  );
}
