import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-violet text-on-primary border border-violet hover:bg-violet-dark hover:border-violet-dark shadow-[0_6px_18px_-8px_var(--violet)]",
  accent: "bg-rose text-on-primary border border-rose hover:bg-rose-dark hover:border-rose-dark shadow-[0_6px_18px_-8px_var(--rose)]",
  secondary: "bg-surface text-ink border border-line-strong hover:border-violet hover:text-violet",
  soft: "bg-violet-soft text-violet border border-transparent hover:border-violet/40",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-violet-soft hover:text-violet",
  danger: "bg-surface text-danger border border-danger/40 hover:bg-rose-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-[0.95rem] gap-2",
  lg: "h-13 px-6 text-base gap-2",
};

/** Rounded rectangles with a soft press, never pill shaped. */
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
