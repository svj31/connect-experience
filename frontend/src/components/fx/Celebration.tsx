"use client";

import { useEffect, useRef } from "react";
import type { AvatarConfig } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Burst } from "./Burst";

/**
 * The "It's a Saath" moment: two planets fly in from either side, meet, and a heart
 * appears with a burst of sparks. Used for mutual matches, accepted requests and bond level ups.
 */
export function Celebration({
  open,
  title,
  message,
  me,
  them,
  primary,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  me?: { name: string; avatar?: Partial<AvatarConfig> };
  them?: { name: string; avatar?: Partial<AvatarConfig> };
  primary?: { label: string; onClick: () => void };
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="celebrate-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-visible rounded-3xl border border-line-strong bg-surface p-0 text-ink backdrop:bg-[#130f22]/60 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="relative px-6 pt-10 pb-7 text-center">
          <div className="relative mx-auto flex h-36 items-center justify-center">
            <Burst count={22} distance={140} />
            <div className="collide-l absolute">{me && <Avatar name={me.name} config={me.avatar} size={84} />}</div>
            <div className="collide-r absolute">{them && <Avatar name={them.name} config={them.avatar} size={84} />}</div>
            <svg viewBox="0 0 24 24" width="40" height="40" className="relative animate-heartbeat drop-shadow" fill="var(--rose)" aria-hidden="true">
              <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />
            </svg>
          </div>
          <h2 id="celebrate-title" className="mt-4 font-display text-3xl font-semibold">{title}</h2>
          <p className="mx-auto mt-2 max-w-xs text-muted">{message}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {primary && <Button onClick={primary.onClick}>{primary.label}</Button>}
            <Button variant="secondary" onClick={onClose}>Keep exploring</Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
