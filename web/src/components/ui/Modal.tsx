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
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-lg"} rounded-lg border border-line-strong bg-surface p-0 text-ink shadow-[0_20px_60px_rgba(31,29,26,0.18)] backdrop:bg-ink/30`}
    >
      {open && (
        <div className="animate-pop p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="font-display text-2xl font-semibold">{title}</h2>
            <button onClick={onClose} className="rounded-md p-1.5 text-muted hover:bg-paper-deep hover:text-ink">
              <Icon name="close" label="Close" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
