"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { SECTION_LABELS, VISIBILITY_LABELS } from "@/lib/labels";
import { useSession } from "@/lib/session";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import type { Me, Privacy, PrivacySection, Settings as SettingsT, Visibility } from "@/lib/types";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { PageLoader } from "../ui/Loader";
import { PageHeader } from "./widgets";

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line p-4 hover:border-line-strong">
      <span><span className="block font-semibold">{label}</span>{hint && <span className="block text-sm text-muted">{hint}</span>}</span>
      <span className="relative shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="block h-7 w-12 rounded-full bg-line-strong transition-colors peer-checked:bg-violet peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet" />
        <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6" aria-label={title}>
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold"><Icon name={icon} className="text-violet" />{title}</h2>
      {children}
    </section>
  );
}

export function Settings() {
  const router = useRouter();
  const { user, setUser, logout } = useSession();
  const { prefs, setPrefs } = useTheme();
  const [privacy, setPrivacy] = useState<Privacy | null>(user?.privacy ?? null);
  const [settings, setSettings] = useState<SettingsT | null>(user?.settings ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  if (!user || !privacy || !settings) return <PageLoader variant="shield" caption="Opening your settings" />;

  async function saveSettings(next: SettingsT) {
    setSettings(next);
    setPrefs({ theme: next.theme, cursor: next.cursor, motion: next.motion });
    try {
      const { user: u } = await api<{ user: Me }>("/profile/settings", { method: "PUT", body: next });
      setUser(u);
      setStatus("Saved");
    } catch (e) {
      setStatus(errorMessage(e));
    }
  }
  async function savePrivacy(next: Privacy) {
    setPrivacy(next);
    try {
      const { user: u } = await api<{ user: Me }>("/profile/privacy", { method: "PUT", body: next });
      setUser(u);
      setStatus("Privacy saved");
    } catch (e) {
      setStatus(errorMessage(e));
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api("/profile", { method: "DELETE", body: { confirm } });
      await logout();
      router.push("/");
    } catch (e) {
      setStatus(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings and privacy" icon="settings" subtitle="How SaathVerse looks, who can find you, and who sees each part of your profile." actions={status && <span role="status" className="rounded-lg bg-mint-soft px-2.5 py-1 text-sm font-semibold text-mint">{status}</span>} />
      <div className="space-y-5">
        <Section title="Appearance" icon="sparkle">
          <fieldset>
            <legend className="mb-2 font-semibold">Theme</legend>
            <div className="grid grid-cols-3 gap-2">
              {([["light", "sun", "Light"], ["dark", "moon", "Dark"], ["system", "phone", "Match device"]] as [ThemeChoice, string, string][]).map(([v, icon, label]) => (
                <button key={v} aria-pressed={settings.theme === v} onClick={() => saveSettings({ ...settings, theme: v })} className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 font-semibold transition-colors ${settings.theme === v ? "border-violet bg-violet-soft" : "border-line hover:border-line-strong"}`}>
                  <Icon name={icon} size={24} className="text-violet" /> {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Toggle label="Playful cursor" hint="Orbit ring, hearts and sparks on desktop" checked={settings.cursor} onChange={(v) => saveSettings({ ...settings, cursor: v })} />
            <Toggle label="Reduce motion" hint="Calmer pages with fewer animations" checked={settings.motion === "reduced"} onChange={(v) => saveSettings({ ...settings, motion: v ? "reduced" : "full" })} />
          </div>
          {prefs.theme !== settings.theme && <p className="mt-2 text-xs text-muted">This device is using a different theme than your saved one.</p>}
        </Section>

        <Section title="Discovery" icon="discover">
          <div className="space-y-2">
            <Toggle label="Show me in Discover" hint="Turn off to only be found by people you are already connected with" checked={privacy.discoverable} onChange={(v) => savePrivacy({ ...privacy, discoverable: v })} />
            <Toggle label="Show when I am online" hint="Others see a green dot when you are here" checked={privacy.showOnline} onChange={(v) => savePrivacy({ ...privacy, showOnline: v })} />
            <Toggle label="Show Vibe Match scores" hint="When off, you do not see scores and nobody sees one with you" checked={privacy.showVibe} onChange={(v) => savePrivacy({ ...privacy, showVibe: v })} />
          </div>
          <fieldset className="mt-4">
            <legend className="font-semibold">Default age range in Discover: {settings.ageMin} to {settings.ageMax}</legend>
            <div className="mt-2 flex gap-3">
              <label className="flex-1 text-sm">Youngest
                <input type="range" min={18} max={70} value={settings.ageMin} onChange={(e) => setSettings({ ...settings, ageMin: Math.min(Number(e.target.value), settings.ageMax) })} onPointerUp={() => saveSettings(settings)} onKeyUp={() => saveSettings(settings)} className="w-full accent-[var(--violet)]" />
              </label>
              <label className="flex-1 text-sm">Oldest
                <input type="range" min={18} max={70} value={settings.ageMax} onChange={(e) => setSettings({ ...settings, ageMax: Math.max(Number(e.target.value), settings.ageMin) })} onPointerUp={() => saveSettings(settings)} onKeyUp={() => saveSettings(settings)} className="w-full accent-[var(--rose)]" />
              </label>
            </div>
          </fieldset>
        </Section>

        <Section title="Who sees what" icon="eye">
          <p className="mb-4 text-sm text-muted">Each part of your profile has its own audience. Bond levels grow from things you do together, so closer people see more.</p>
          <ul className="space-y-2">
            {(Object.keys(SECTION_LABELS) as PrivacySection[]).map((s) => (
              <li key={s} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-3">
                <span><span className="block font-semibold">{SECTION_LABELS[s].label}</span><span className="block text-sm text-muted">{SECTION_LABELS[s].hint}</span></span>
                <label className="sr-only" htmlFor={`vis-${s}`}>Who can see {SECTION_LABELS[s].label}</label>
                <select id={`vis-${s}`} value={privacy[s]} onChange={(e) => savePrivacy({ ...privacy, [s]: e.target.value as Visibility })} className="h-10 rounded-xl border border-line-strong bg-surface px-3 text-sm font-semibold">
                  {Object.entries(VISIBILITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}: {v.hint}</option>)}
                </select>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Your data" icon="download">
          <p className="text-muted">Download everything we hold about you as a JSON file, or delete your account for good.</p>
          <a href="/api/profile/export" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 font-semibold hover:border-violet hover:text-violet" download>
            <Icon name="download" size={18} /> Download my data
          </a>
          <div className="mt-6 rounded-2xl border border-danger/40 p-4">
            <p className="font-semibold text-danger">Delete account</p>
            <p className="text-sm text-muted">Removes your profile, connections, messages and the tables you host. This cannot be undone.</p>
            <label htmlFor="confirm-delete" className="mt-3 block text-sm font-semibold">Type DELETE to confirm</label>
            <div className="mt-1 flex gap-2">
              <input id="confirm-delete" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 w-40 rounded-xl border border-line-strong bg-surface px-3" />
              <Button variant="danger" disabled={confirm !== "DELETE"} loading={busy} onClick={remove}>Delete forever</Button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
