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
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-[32px] border-0 bg-[#09090c] p-0 text-white shadow-[0_40px_120px_-30px_rgb(255_46_106/0.6)] backdrop:bg-black/70 backdrop:backdrop-blur-md"
    >
      {open && (
        <div className="relative px-6 pt-12 pb-8 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgb(255_46_106/0.45),transparent)]" />
          <div className="relative mx-auto flex h-40 items-center justify-center">
            <Burst count={22} distance={140} />
            <div className="collide-l absolute">{me && <span className="block rounded-full ring-4 ring-white"><Avatar name={me.name} config={me.avatar} size={104} /></span>}</div>
            <div className="collide-r absolute">{them && <span className="block rounded-full ring-4 ring-white"><Avatar name={them.name} config={them.avatar} size={104} /></span>}</div>
            <span className="bg-brand relative flex h-14 w-14 animate-heartbeat items-center justify-center rounded-full ring-4 ring-[#09090c]" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" /></svg>
            </span>
          </div>
          <h2 id="celebrate-title" className="text-brand relative mt-6 font-display text-5xl font-extrabold tracking-tight italic">{title}</h2>
          <p className="relative mx-auto mt-3 max-w-xs text-white/75">{message}</p>
          <div className="relative mt-8 flex flex-col gap-2">
            {primary && <Button size="lg" onClick={primary.onClick}>{primary.label}</Button>}
            <Button variant="ghost" size="lg" className="!text-white hover:!bg-white/10" onClick={onClose}>Keep swiping</Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
