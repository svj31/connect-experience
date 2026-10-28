"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

/** Native <dialog> gives focus trapping, Escape to close and an inert background for free. */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-lg"} rounded-[28px] border border-line bg-surface p-0 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45)] backdrop:bg-black/60 backdrop:backdrop-blur-md`}
    >
      {open && (
        <div className="animate-pop p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>
            <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-deep text-muted hover:text-ink">
              <Icon name="close" label="Close" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
