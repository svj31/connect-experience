import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

const inputBase =
  "w-full rounded-xl border bg-surface px-3 text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-violet/25";

export function Field({
  label,
  error,
  hint,
  className = "",
  children,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; children?: ReactNode }) {
  const id = useId();
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputBase} h-11 ${error ? "border-danger" : "border-line-strong focus:border-violet"}`}
          {...rest}
        />
        {children}
      </div>
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger" role="alert">{error}</p>}
    </div>
  );
}

export function TextArea({
  label,
  error,
  hint,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${inputBase} min-h-28 py-2.5 ${error ? "border-danger" : "border-line-strong focus:border-violet"}`}
        {...rest}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger" role="alert">{error}</p>}
    </div>
  );
}

/** Hidden field that people never see or fill. Bots that fill every input reveal themselves. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-md border border-danger/40 bg-rose-soft px-3 py-2 text-sm font-medium text-danger">
      {message}
    </div>
  );
}
