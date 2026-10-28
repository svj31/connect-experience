"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import {
  GENDER_LABELS, INTENT_LABELS, LANGUAGES, LIFESTYLE_OPTIONS, LOOKING_LABELS, LOVE_LABELS, PERSONALITY_LABELS, STAR_SIGNS, cap,
} from "@/lib/labels";
import { useSession } from "@/lib/session";
import {
  AVATAR_COLORS, AVATAR_FACES, AVATAR_PATTERNS, AVATAR_RINGS, AVATAR_SHAPES, INTERESTS, type AvatarConfig, type Me, type PrivacySection, type Profile,
} from "@/lib/types";
import { Burst } from "../fx/Burst";
import { Avatar } from "../ui/Avatar";
import { PhotoManager } from "./PhotoManager";
import { Button } from "../ui/Button";
import { Field, TextArea } from "../ui/Field";
import { Icon } from "../ui/Icon";
import { PageLoader } from "../ui/Loader";
import { ProfileView } from "./ProfileView";
import { PageHeader } from "./widgets";

interface Catalog { prompts: { id: string; text: string }[]; quiz: { id: string; text: string; options: string[] }[] }

const select = "h-11 w-full rounded-2xl border border-transparent bg-paper-deep px-4 focus:border-violet focus:outline-none";

function Card({ title, icon, hint, children }: { title: string; icon: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6" aria-label={title}>
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><Icon name={icon} className="text-violet" />{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Pills<T extends string>({ value, options, onChange, label }: { value: T | ""; options: Record<string, string>; onChange: (v: T | "") => void; label: string }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(options).map(([k, v]) => (
          <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(value === k ? "" : (k as T))} className={`rounded-full border px-2.5 py-1.5 text-sm font-semibold transition-colors ${value === k ? "border-transparent bg-brand text-white" : "border-line-strong hover:border-violet"}`}>
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const LEVEL_OF: Record<string, number> = { everyone: 0, connections: 1, spark: 2, orbit: 3, private: 9 };

/** Shows your own profile as a stranger, a connection or a closer bond would see it. */
function asSeenBy(me: Me, level: number): Profile {
  const hide = (s: PrivacySection) => LEVEL_OF[me.privacy[s]] > level;
  const locked: Profile["locked"] = {};
  (["basics", "about", "lifestyle", "work", "prompts", "socials"] as PrivacySection[]).forEach((s) => {
    if (hide(s)) locked[s] = me.privacy[s] === "private" ? "Kept private" : `Unlocks at ${me.privacy[s] === "connections" ? "connecting" : cap(me.privacy[s]) + " bond"}`;
  });
  return {
    ...me,
    age: hide("basics") ? null : me.age, gender: hide("basics") ? null : me.gender, city: hide("basics") ? null : me.city,
    heightCm: hide("basics") ? null : me.heightCm, languages: hide("basics") ? null : me.languages, starSign: hide("basics") ? null : me.starSign,
    bio: hide("about") ? null : me.bio, personality: hide("about") ? null : me.personality, loveLanguage: hide("about") ? null : me.loveLanguage,
    lifestyle: hide("lifestyle") ? null : me.lifestyle, job: hide("work") ? null : me.job, education: hide("work") ? null : me.education,
    prompts: hide("prompts") ? null : me.prompts, handle: hide("socials") ? null : me.handle, locked,
  };
}

export function ProfileEditor() {
  const params = useSearchParams();
  const welcome = params.get("welcome") === "1";
  const { user, setUser } = useSession();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [seenAs, setSeenAs] = useState(0);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(0);

  useEffect(() => {
    api<Catalog>("/me/catalog").then(setCatalog).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user || form) return;
    // The form starts from the saved profile once it has loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      displayName: user.displayName, pronouns: user.pronouns, bio: user.bio ?? "", handle: user.handle ?? "",
      interests: user.interests, avatarShape: user.avatar.shape, avatarColor: user.avatar.color,
      avatar: { ring: user.avatar.ring, pattern: user.avatar.pattern, face: user.avatar.face },
      birthYear: user.birthYear, gender: user.gender ?? "", lookingFor: user.lookingFor, intent: user.intent, city: user.city ?? "",
      job: user.job ?? "", education: user.education ?? "", heightCm: user.heightCm, starSign: user.starSign ?? "",
      languages: user.languages ?? [], lifestyle: user.lifestyle ?? {}, loveLanguage: user.loveLanguage ?? "", personality: user.personality ?? "",
      prompts: user.rawPrompts, quiz: user.quiz, photos: user.photos ?? [],
    });
  }, [user, form]);

  const avatar = useMemo<AvatarConfig | null>(() => {
    if (!form) return null;
    const a = form.avatar as Omit<AvatarConfig, "shape" | "color">;
    return { shape: form.avatarShape as AvatarConfig["shape"], color: form.avatarColor as AvatarConfig["color"], ...a };
  }, [form]);

  if (!user || !form || !avatar) return <PageLoader variant="orbit" caption="Polishing your planet" />;
  const set = (patch: Record<string, unknown>) => {
    setForm((f) => ({ ...f!, ...patch }));
    setStatus(null);
  };
  const setAvatar = (patch: Partial<AvatarConfig>) => {
    const { shape, color, ...rest } = patch;
    set({ ...(shape ? { avatarShape: shape } : {}), ...(color ? { avatarColor: color } : {}), avatar: { ...(form.avatar as object), ...rest } });
  };
  const interests = form.interests as string[];
  const prompts = form.prompts as { id: string; answer: string }[];
  const quiz = form.quiz as Record<string, number>;
  const lifestyle = form.lifestyle as Record<string, string>;
  const languages = form.languages as string[];
  const year = new Date().getFullYear();

  async function save() {
    setSaving(true);
    setErrors({});
    const body = { ...form, prompts: prompts.filter((p) => p.answer.trim().length >= 2), birthYear: form!.birthYear || null, heightCm: form!.heightCm || null };
    try {
      const { user: next } = await api<{ user: Me }>("/profile", { method: "PUT", body });
      setUser(next);
      setStatus("Saved. Looking good.");
      setSaved((n) => n + 1);
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.fields);
      setStatus(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My profile"
        icon="user"
        subtitle={`${user.completeness.percent}% complete${user.completeness.missing.length ? `. Still to add: ${user.completeness.missing.slice(0, 3).join(", ").toLowerCase()}.` : "."}`}
        actions={
          <div role="tablist" className="flex rounded-full bg-paper-deep p-1">
            {(["edit", "preview"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold ${tab === t ? "bg-surface text-ink shadow-[var(--shadow)]" : "text-muted hover:text-ink"}`}>
                <Icon name={t === "edit" ? "edit" : "eye"} size={16} /> {t === "edit" ? "Edit" : "Preview"}
              </button>
            ))}
          </div>
        }
      />
      {welcome && tab === "edit" && (
        <div className="mb-5 flex items-center gap-4 rounded-[24px] border border-violet/30 bg-violet-soft p-5">
          <Icon name="sparkle" size={28} className="shrink-0 text-violet" />
          <p><strong>Welcome to SaathVerse!</strong> Design your planet, add a couple of prompts and take the Vibe Quiz. The more you fill in, the better your Vibe Match and suggestions get. You choose who sees what in Settings.</p>
        </div>
      )}

      {tab === "preview" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">See it as:</span>
            {["A stranger", "A connection", "Spark bond", "Orbit bond"].map((label, i) => (
              <button key={label} aria-pressed={seenAs === i} onClick={() => setSeenAs(i)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${seenAs === i ? "border-transparent bg-brand text-white" : "border-line-strong bg-surface"}`}>{label}</button>
            ))}
          </div>
          <ProfileView profile={asSeenBy(user, seenAs)} />
        </>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <Card title="Photos" icon="eye" hint="Up to six. The first one is what people see on your card.">
              <PhotoManager photos={form.photos as string[]} onChange={(photos) => set({ photos })} error={Object.entries(errors).find(([k]) => k.startsWith("photos"))?.[1]} />
            </Card>
            <Card title="Your planet" icon="sparkle" hint="Shown when you have no photo, and in games. Tap anything to change it.">
              <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                <div className="flex items-center justify-center rounded-[24px] bg-paper-deep p-4">
                  <div key={JSON.stringify(avatar)} className="animate-pop"><div className="animate-float"><Avatar name={String(form.displayName)} config={avatar} size={150} /></div></div>
                </div>
                <div className="space-y-3">
                  {([["Shape", "shape", AVATAR_SHAPES], ["Rings", "ring", AVATAR_RINGS], ["Surface", "pattern", AVATAR_PATTERNS], ["Mood", "face", AVATAR_FACES]] as const).map(([label, key, list]) => (
                    <fieldset key={key}>
                      <legend className="mb-1 text-sm font-semibold">{label}</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((v) => (
                          <button key={v} type="button" aria-pressed={avatar[key] === v} onClick={() => setAvatar({ [key]: v })} className={`rounded-xl border-2 p-0.5 transition-transform hover:scale-110 ${avatar[key] === v ? "border-violet" : "border-transparent"}`} title={cap(v)}>
                            <Avatar name={cap(v)} config={{ ...avatar, [key]: v }} size={38} decorative />
                            <span className="sr-only">{cap(v)}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  <fieldset>
                    <legend className="mb-1 text-sm font-semibold">Color</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {AVATAR_COLORS.map((c) => (
                        <button key={c} type="button" aria-pressed={avatar.color === c} onClick={() => setAvatar({ color: c })} className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${avatar.color === c ? "border-ink" : "border-transparent"}`} title={cap(c)}>
                          <Avatar name={c} config={{ ...avatar, color: c, ring: "none", face: "none", pattern: "plain", shape: "circle" }} size={28} decorative />
                          <span className="sr-only">{cap(c)}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            </Card>

            <Card title="The basics" icon="info">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" value={String(form.displayName)} onChange={(e) => set({ displayName: e.target.value })} error={errors.displayName} maxLength={32} />
                <Field label="Pronouns" value={String(form.pronouns)} onChange={(e) => set({ pronouns: e.target.value })} placeholder="she/her, they/them" maxLength={24} />
                <div>
                  <label htmlFor="by" className="mb-1.5 block text-sm font-semibold">Birth year</label>
                  <select id="by" className={select} value={String(form.birthYear ?? "")} onChange={(e) => set({ birthYear: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">Prefer not to say</option>
                    {Array.from({ length: 63 }, (_, i) => year - 18 - i).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.birthYear && <p role="alert" className="mt-1 text-sm text-danger">{errors.birthYear}</p>}
                </div>
                <Field label="City" value={String(form.city)} onChange={(e) => set({ city: e.target.value })} placeholder="Mumbai" maxLength={40} />
                <div>
                  <label htmlFor="gender" className="mb-1.5 block text-sm font-semibold">I am a</label>
                  <select id="gender" className={select} value={String(form.gender)} onChange={(e) => set({ gender: e.target.value })}>
                    <option value="">Choose</option>
                    {Object.entries(GENDER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="lf" className="mb-1.5 block text-sm font-semibold">Interested in meeting</label>
                  <select id="lf" className={select} value={String(form.lookingFor)} onChange={(e) => set({ lookingFor: e.target.value })}>
                    {Object.entries(LOOKING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Pills label="Here for" value={String(form.intent) as never} options={INTENT_LABELS} onChange={(v) => set({ intent: v || "not-sure" })} />
                </div>
                <div>
                  <label htmlFor="height" className="mb-1.5 block text-sm font-semibold">Height (cm)</label>
                  <input id="height" type="number" min={120} max={230} className={select} value={String(form.heightCm ?? "")} onChange={(e) => set({ heightCm: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <label htmlFor="sign" className="mb-1.5 block text-sm font-semibold">Star sign</label>
                  <select id="sign" className={select} value={String(form.starSign)} onChange={(e) => set({ starSign: e.target.value })}>
                    <option value="">Skip</option>
                    {STAR_SIGNS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                  </select>
                </div>
                <fieldset className="sm:col-span-2">
                  <legend className="mb-1.5 text-sm font-semibold">Languages</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((l) => {
                      const on = languages.includes(l);
                      return <button key={l} type="button" aria-pressed={on} disabled={!on && languages.length >= 6} onClick={() => set({ languages: on ? languages.filter((x) => x !== l) : [...languages, l] })} className={`rounded-full border px-2.5 py-1 text-sm font-semibold disabled:opacity-40 ${on ? "border-transparent bg-brand text-white" : "border-line-strong"}`}>{l}</button>;
                    })}
                  </div>
                </fieldset>
              </div>
            </Card>

            <Card title="About you" icon="smile">
              <TextArea label="Bio" value={String(form.bio)} onChange={(e) => set({ bio: e.target.value })} maxLength={280} hint={`${String(form.bio).length}/280. Something specific beats something perfect.`} error={errors.bio} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Pills label="Social energy" value={String(form.personality) as never} options={PERSONALITY_LABELS} onChange={(v) => set({ personality: v })} />
                <Pills label="Love language" value={String(form.loveLanguage) as never} options={LOVE_LABELS} onChange={(v) => set({ loveLanguage: v })} />
              </div>
              <fieldset className="mt-4">
                <legend className="mb-1.5 text-sm font-semibold">Interests <span className="font-normal text-muted">({interests.length}/10)</span></legend>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map((i) => {
                    const on = interests.includes(i);
                    return <button key={i} type="button" aria-pressed={on} disabled={!on && interests.length >= 10} onClick={() => set({ interests: on ? interests.filter((x) => x !== i) : [...interests, i] })} className={`rounded-full border px-2.5 py-1 text-sm font-semibold disabled:opacity-40 ${on ? "border-rose bg-brand text-white" : "border-line-strong hover:border-rose"}`}>{cap(i)}</button>;
                  })}
                </div>
              </fieldset>
            </Card>

            <Card title="Prompts" icon="deeptalk" hint="Pick up to three. People can reply to a prompt when they connect.">
              <div className="space-y-3">
                {prompts.map((p, idx) => (
                  <div key={idx} className="rounded-2xl bg-paper-deep p-3">
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`prompt-${idx}`}>Prompt</label>
                      <select id={`prompt-${idx}`} className={`${select} h-10`} value={p.id} onChange={(e) => set({ prompts: prompts.map((x, i) => (i === idx ? { ...x, id: e.target.value } : x)) })}>
                        {catalog?.prompts.filter((c) => c.id === p.id || !prompts.some((x) => x.id === c.id)).map((c) => <option key={c.id} value={c.id}>{c.text}</option>)}
                      </select>
                      <button type="button" onClick={() => set({ prompts: prompts.filter((_, i) => i !== idx) })} className="rounded-lg p-2 text-muted hover:text-danger"><Icon name="trash" size={16} label="Remove prompt" /></button>
                    </div>
                    <label className="sr-only" htmlFor={`answer-${idx}`}>Your answer</label>
                    <textarea id={`answer-${idx}`} rows={2} value={p.answer} maxLength={160} onChange={(e) => set({ prompts: prompts.map((x, i) => (i === idx ? { ...x, answer: e.target.value } : x)) })} placeholder="Your answer" className="mt-2 w-full resize-none rounded-2xl border border-transparent bg-paper-deep px-4 py-3 focus:border-violet focus:bg-surface focus:outline-none" />
                  </div>
                ))}
                {prompts.length < 3 && catalog && (
                  <Button type="button" variant="soft" size="sm" onClick={() => set({ prompts: [...prompts, { id: catalog.prompts.find((c) => !prompts.some((x) => x.id === c.id))!.id, answer: "" }] })}>
                    <Icon name="plus" size={16} /> Add a prompt
                  </Button>
                )}
                {errors.prompts && <p role="alert" className="text-sm text-danger">{errors.prompts}</p>}
              </div>
            </Card>

            <Card title="Lifestyle" icon="leaf" hint="Only shown to people you choose in Settings.">
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(LIFESTYLE_OPTIONS).map(([key, { label, options }]) => (
                  <Pills key={key} label={label} value={(lifestyle[key] ?? "") as never} options={options} onChange={(v) => set({ lifestyle: { ...lifestyle, [key]: v || undefined } })} />
                ))}
              </div>
            </Card>

            <Card title="Work, study and socials" icon="briefcase">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Job" value={String(form.job)} onChange={(e) => set({ job: e.target.value })} maxLength={60} />
                <Field label="Education" value={String(form.education)} onChange={(e) => set({ education: e.target.value })} maxLength={60} />
                <Field label="Handle elsewhere" value={String(form.handle)} onChange={(e) => set({ handle: e.target.value })} maxLength={60} hint="Shared only at the bond level you choose" className="sm:col-span-2" />
              </div>
            </Card>

            <Card title="Vibe Quiz" icon="zap" hint="Six quick questions. Matching answers raise your Vibe Match with someone.">
              <ol className="space-y-4">
                {catalog?.quiz.map((q, i) => (
                  <li key={q.id}>
                    <p className="mb-1.5 font-semibold">{i + 1}. {q.text}</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {q.options.map((o, idx) => (
                        <button key={o} type="button" aria-pressed={quiz[q.id] === idx} onClick={() => set({ quiz: { ...quiz, [q.id]: idx } })} className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition-all ${quiz[q.id] === idx ? "border-violet bg-violet-soft" : "border-line hover:border-line-strong"}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="relative overflow-hidden rounded-[24px] border border-line bg-surface p-5 text-center">
              {saved > 0 && <Burst key={saved} count={14} distance={90} />}
              <Avatar name={String(form.displayName)} config={avatar} size={96} />
              <p className="mt-2 font-display text-2xl font-bold">{String(form.displayName)}</p>
              <p className="text-sm text-muted">{INTENT_LABELS[String(form.intent)]}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-rose" style={{ width: `${user.completeness.percent}%` }} /></div>
              <p className="mt-1 text-xs text-muted">{user.completeness.percent}% complete</p>
              <Button className="mt-4 w-full" onClick={save} loading={saving}><Icon name="save" size={16} /> Save profile</Button>
              {status && <p role="status" className={`mt-2 text-sm font-semibold ${Object.keys(errors).length ? "text-danger" : "text-mint"}`}>{status}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
