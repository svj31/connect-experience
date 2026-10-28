"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { useSession } from "@/lib/session";
import type { Me } from "@/lib/types";
import { validateAdminSignup, validateEmail, validateSignup, type Errors } from "@/lib/validation";
import { LogoMark } from "./brand/Logo";
import { DemoButton } from "./landing/DemoButtons";
import { Button } from "./ui/Button";
import { Field, FormError, Honeypot } from "./ui/Field";
import { Icon } from "./ui/Icon";

/** Only same site paths are allowed as a return address after signing in. */
export function safeNext(raw: string | null, fallback: string) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

type Role = "user" | "admin";

function RoleTabs({ role, base }: { role: Role; base: "/login" | "/signup" }) {
  return (
    <div role="tablist" aria-label="Account type" className="grid grid-cols-2 gap-1 rounded-full bg-paper-deep p-1">
      {(["user", "admin"] as Role[]).map((r) => (
        <Link
          key={r}
          role="tab"
          aria-selected={role === r}
          href={r === "admin" ? `${base}?as=admin` : base}
          replace
          className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-colors ${role === r ? "bg-surface text-ink shadow-[var(--shadow)]" : "text-muted hover:text-ink"}`}
        >
          <Icon name={r === "admin" ? "shield" : "heart"} size={16} className={r === "admin" ? "text-rose" : "text-violet"} />
          {r === "admin" ? "Admin" : "Member"}
        </Link>
      ))}
    </div>
  );
}

const COLLAGE = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=700&fit=crop&q=80",
];

/** Split screen: a photo collage with the promise on the left, a clean form on the right. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_460px] lg:py-12">
      <div className="relative hidden overflow-hidden rounded-[36px] bg-[#09090c] lg:block" aria-hidden="true">
        <div className="grid h-full grid-cols-3 gap-2 p-2 opacity-90">
          {COLLAGE.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={`h-full min-h-40 w-full rounded-[22px] object-cover ${i % 2 ? "translate-y-8" : ""}`} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-[#09090c]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <LogoMark size={52} title="" />
          <p className="mt-5 max-w-md font-display text-4xl leading-[1.05] font-extrabold tracking-tight">Someone is about to pick the same answer as you.</p>
          <p className="mt-3 text-white/70">Swipe, match, then meet over a game instead of a &ldquo;hey&rdquo;.</p>
        </div>
      </div>
      <div className="animate-rise flex flex-col justify-center rounded-[32px] border border-line bg-surface p-6 shadow-[var(--shadow)] sm:p-10">
        <LogoMark size={48} title="" className="mb-6 lg:hidden" />
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export function LoginForm() {
  const params = useSearchParams();
  const role: Role = params.get("as") === "admin" ? "admin" : "user";
  const router = useRouter();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
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
      if (role === "admin" && user.role !== "admin") {
        await api("/auth/logout", { method: "POST" }).catch(() => undefined);
        setFormError("This account is not an admin. Use the Member tab to sign in.");
        setBusy(false);
        return;
      }
      setUser(user);
      track("login");
      router.push(safeNext(params.get("next"), user.role === "admin" ? "/admin" : "/app"));
    } catch (err) {
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthShell title={role === "admin" ? "Admin sign in" : "Welcome back"} subtitle={role === "admin" ? "Moderation, safety and analytics." : "Your orbit missed you."}>
      <RoleTabs role={role} base="/login" />
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <FormError message={formError} />
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Button type="submit" loading={busy} className="w-full">Sign in</Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <DemoButton as={role} variant="soft" className="w-full [&>button]:w-full">
        {role === "admin" ? "Use the demo admin account" : "Use the demo member account"}
      </DemoButton>
      <p className="mt-5 text-center text-sm text-muted">
        {role === "admin" ? "Have an invite code? " : "New here? "}
        <Link href={role === "admin" ? "/signup?as=admin" : "/signup"} className="font-semibold text-violet hover:underline">
          {role === "admin" ? "Create an admin account" : "Create your planet"}
        </Link>
      </p>
    </AuthShell>
  );
}

export function SignupForm() {
  const params = useSearchParams();
  const role: Role = params.get("as") === "admin" ? "admin" : "user";
  const router = useRouter();
  const { setUser } = useSession();
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [values, setValues] = useState({ displayName: "", email: "", password: "", inviteCode: "", ageConfirmed: false });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = role === "admin" ? validateAdminSignup(values) : validateSignup(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError(null);
    try {
      const body = role === "admin"
        ? { email: values.email, password: values.password, displayName: values.displayName, inviteCode: values.inviteCode, website, startedAt: startedAt.current }
        : { email: values.email, password: values.password, displayName: values.displayName, ageConfirmed: values.ageConfirmed, website, startedAt: startedAt.current };
      const { user } = await api<{ user: Me }>(role === "admin" ? "/auth/admin-signup" : "/auth/signup", { body });
      setUser(user);
      track(role === "admin" ? "admin_signup" : "signup");
      router.push(role === "admin" ? "/admin" : "/app/profile?welcome=1");
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthShell title={role === "admin" ? "Join the admin team" : "Create your planet"} subtitle={role === "admin" ? "Admin accounts need an invite code from your team." : "It takes a minute. No photo needed."}>
      <RoleTabs role={role} base="/signup" />
      <form onSubmit={submit} noValidate className="relative mt-5 space-y-4">
        <FormError message={formError} />
        <Honeypot value={website} onChange={setWebsite} />
        <Field label="First name or nickname" autoComplete="given-name" value={values.displayName} onChange={(e) => set("displayName", e.target.value)} error={errors.displayName} hint="This is what people see first" />
        <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} error={errors.email} hint="Never shown to anyone" />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          error={errors.password}
          hint={role === "admin" ? "At least 10 characters with a letter and a number" : "At least 8 characters with a letter and a number"}
        />
        {role === "admin" ? (
          <Field label="Invite code" value={values.inviteCode} onChange={(e) => set("inviteCode", e.target.value)} error={errors.inviteCode} hint="Ask your team lead. The hackathon demo code is in the README." autoComplete="off" />
        ) : (
          <div>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={values.ageConfirmed} onChange={(e) => set("ageConfirmed", e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--violet)]" aria-invalid={errors.ageConfirmed ? true : undefined} />
              <span>
                I am 18 or older and agree to the <Link href="/terms" className="font-semibold text-violet underline">terms</Link> and{" "}
                <Link href="/privacy" className="font-semibold text-violet underline">privacy policy</Link>.
              </span>
            </label>
            {errors.ageConfirmed && <p role="alert" className="mt-1 text-sm font-medium text-danger">{errors.ageConfirmed}</p>}
          </div>
        )}
        <Button type="submit" loading={busy} className="w-full" variant={role === "admin" ? "accent" : "primary"}>
          {role === "admin" ? "Create admin account" : "Create my account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account? <Link href={role === "admin" ? "/login?as=admin" : "/login"} className="font-semibold text-violet hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
