"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { useSession } from "@/lib/session";
import type { Me } from "@/lib/types";
import { validateEmail, validateSignup, type Errors } from "@/lib/validation";
import { Button } from "./ui/Button";
import { Field, FormError, Honeypot } from "./ui/Field";
import { Icon } from "./ui/Icon";

/** Only same-site paths are allowed as a post login destination. */
export function safeNext(next: string | null, fallback: string): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:text-ink">
      <Icon name={shown ? "eyeOff" : "eye"} size={18} label={shown ? "Hide password" : "Show password"} />
    </button>
  );
}

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useSession();
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [values, setValues] = useState({ displayName: "", email: "", password: "", ageConfirmed: false });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof values) => (value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateSignup(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError(null);
    try {
      const { user } = await api<{ user: Me }>("/auth/signup", { body: { ...values, website, startedAt: startedAt.current } });
      setUser(user);
      track("signup");
      router.push(`/profile?welcome=1&next=${encodeURIComponent(safeNext(params.get("next"), "/lobby"))}`);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-4">
      <FormError message={formError} />
      <Field label="First name or nickname" autoComplete="nickname" value={values.displayName} onChange={(e) => set("displayName")(e.target.value)} error={errors.displayName} hint="This is what your partner sees first." maxLength={32} required />
      <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} hint="Never shown to anyone." required />
      <Field label="Password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.password} onChange={(e) => set("password")(e.target.value)} error={errors.password} hint="At least 8 characters with a letter and a number." required>
        <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
      </Field>
      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[0.95rem]">
          <input type="checkbox" checked={values.ageConfirmed} onChange={(e) => set("ageConfirmed")(e.target.checked)} className="mt-1 h-4 w-4 accent-coral" aria-invalid={errors.ageConfirmed ? true : undefined} />
          <span>
            I am 18 or older and agree to the <Link href="/terms" className="font-semibold text-teal underline">terms</Link> and{" "}
            <Link href="/privacy" className="font-semibold text-teal underline">privacy policy</Link>.
          </span>
        </label>
        {errors.ageConfirmed && <p className="mt-1 text-sm font-medium text-coral-dark" role="alert">{errors.ageConfirmed}</p>}
      </div>
      <Honeypot value={website} onChange={setWebsite} />
      <Button type="submit" variant="accent" size="lg" className="w-full" loading={busy}>Create account</Button>
      <p className="text-center text-sm text-muted">
        Already have an account? <Link href={`/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-semibold text-teal underline">Sign in</Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found: Errors = {};
    const emailError = validateEmail(email);
    if (emailError) found.email = emailError;
    if (!password) found.password = "Enter your password";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError(null);
    try {
      const { user } = await api<{ user: Me }>("/auth/login", { body: { email, password } });
      setUser(user);
      router.push(safeNext(params.get("next"), "/lobby"));
    } catch (err) {
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormError message={formError} />
      <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
      <Field label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required>
        <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={busy}>Sign in</Button>
      <p className="text-center text-sm text-muted">
        New here? <Link href="/signup" className="font-semibold text-teal underline">Create an account</Link>
      </p>
    </form>
  );
}
