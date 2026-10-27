"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import { useRequireUser, useSession } from "@/lib/session";
import { AVATAR_COLORS, AVATAR_SHAPES, INTERESTS, type AvatarColor, type AvatarShape, type Me } from "@/lib/types";
import { validateDisplayName } from "@/lib/validation";
import { safeNext } from "./AuthForms";
import { AVATAR_HEX, Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Field, FormError, TextArea } from "./ui/Field";
import { Icon } from "./ui/Icon";
import { Modal } from "./ui/Modal";
import { PageLoader } from "./ui/Loader";

const MAX_INTERESTS = 8;

type ProfileForm = {
  displayName: string; pronouns: string; bio: string; handle: string; interests: string[]; avatarShape: AvatarShape; avatarColor: AvatarColor;
};

export function ProfileClient() {
  const { user, loading } = useRequireUser();
  if (loading || !user) return <PageLoader variant="draw" caption="Sketching your avatar" />;
  return <ProfileEditor key={user.id} user={user} />;
}

function ProfileEditor({ user }: { user: Me }) {
  const router = useRouter();
  const params = useSearchParams();
  const welcome = params.get("welcome") === "1";
  const { setUser } = useSession();
  const [form, setForm] = useState<ProfileForm>(() => ({
    displayName: user.displayName, pronouns: user.pronouns, bio: user.bio, handle: user.handle,
    interests: user.interests, avatarShape: user.avatarShape, avatarColor: user.avatarColor,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm({ ...form, [key]: value });
    setSaved(false);
  };

  function toggleInterest(interest: string) {
    const has = form.interests.includes(interest);
    if (!has && form.interests.length >= MAX_INTERESTS) return;
    update("interests", has ? form.interests.filter((i) => i !== interest) : [...form.interests, interest]);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const nameError = validateDisplayName(form.displayName);
    setErrors(nameError ? { displayName: nameError } : {});
    if (nameError) return;
    setBusy(true);
    setFormError(null);
    try {
      const { user: updated } = await api<{ user: Me }>("/profile", { method: "PUT", body: form });
      setUser(updated);
      setSaved(true);
      if (welcome) router.push(safeNext(params.get("next"), "/lobby"));
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="animate-rise">
        <h1 className="font-display text-4xl font-semibold">{welcome ? "Make your mark" : "Your profile"}</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {welcome
            ? "Build an avatar from a shape and a color, and pick a few interests. Your bio and handle stay hidden until you choose to reveal them at a table."
            : "Only your name, pronouns, interests and avatar are visible by default. Bio and handle are shown per table, when you choose."}
        </p>
      </header>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section aria-labelledby="avatar-heading" className="h-fit rounded-lg border border-line bg-surface p-5 lg:sticky lg:top-24">
          <h2 id="avatar-heading" className="font-display text-xl font-semibold">Avatar</h2>
          <div className="my-5 flex justify-center">
            <Avatar shape={form.avatarShape} color={form.avatarColor} name={form.displayName || "?"} size={128} />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Shape</legend>
            <div className="grid grid-cols-6 gap-1.5">
              {AVATAR_SHAPES.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => update("avatarShape", shape)}
                  aria-pressed={form.avatarShape === shape}
                  aria-label={shape}
                  className={`rounded-md border-2 p-0.5 ${form.avatarShape === shape ? "border-ink" : "border-transparent hover:border-line-strong"}`}
                >
                  <Avatar shape={shape} color="ink" name=" " size={34} />
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-semibold">Color</legend>
            <div className="grid grid-cols-6 gap-1.5">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => update("avatarColor", color)}
                  aria-pressed={form.avatarColor === color}
                  aria-label={color}
                  className={`h-9 rounded-md border-2 ${form.avatarColor === color ? "border-ink ring-2 ring-ink/20" : "border-white"}`}
                  style={{ background: AVATAR_HEX[color] }}
                />
              ))}
            </div>
          </fieldset>
        </section>

        <div className="space-y-6">
          <FormError message={formError} />
          <section className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-display text-xl font-semibold">Always visible</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} error={errors.displayName} maxLength={32} />
              <Field label="Pronouns (optional)" value={form.pronouns} onChange={(e) => update("pronouns", e.target.value)} error={errors.pronouns} maxLength={24} placeholder="she/her, he/him, they/them" />
            </div>
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">Interests</legend>
              <p className="mb-2 text-sm text-muted">{form.interests.length} of {MAX_INTERESTS} chosen. Used for Quick Match and Common Ground.</p>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map((interest) => {
                  const on = form.interests.includes(interest);
                  const full = !on && form.interests.length >= MAX_INTERESTS;
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      aria-pressed={on}
                      disabled={full}
                      className={`flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-semibold capitalize transition-colors ${on ? "border-teal bg-teal-soft text-teal-dark" : "border-line bg-surface hover:border-ink disabled:opacity-40"}`}
                    >
                      {on && <Icon name="check" size={14} />} {interest}
                    </button>
                  );
                })}
              </div>
              {errors.interests && <p className="mt-1 text-sm font-medium text-coral-dark" role="alert">{errors.interests}</p>}
            </fieldset>
          </section>

          <section className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center gap-2">
              <Icon name="lock" size={18} />
              <h2 className="font-display text-xl font-semibold">Revealed only when you choose</h2>
            </div>
            <TextArea label="Bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} error={errors.bio} maxLength={280} hint={`${form.bio.length} of 280. A few lines about you, in your own words.`} />
            <Field label="Handle" value={form.handle} onChange={(e) => update("handle", e.target.value)} error={errors.handle} maxLength={60} placeholder="@yourname on Instagram, or another way to reach you" />
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="accent" size="lg" loading={busy}>{welcome ? "Save and go to the lobby" : "Save profile"}</Button>
            {saved && <span role="status" className="flex items-center gap-1 font-semibold text-teal"><Icon name="check" size={18} /> Saved</span>}
          </div>

          {!welcome && (
            <section className="rounded-lg border border-coral/30 bg-surface p-5">
              <h2 className="font-display text-xl font-semibold">Delete account</h2>
              <p className="mt-1 text-sm text-muted">Removes your profile, the tables you host, your messages and your moments. This cannot be undone.</p>
              <Button type="button" variant="danger" className="mt-3" onClick={() => setDeleteOpen(true)}>Delete my account</Button>
            </section>
          )}
        </div>
      </form>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?">
        <DeleteAccount onDeleted={() => { setUser(null); router.push("/"); }} />
      </Modal>
    </div>
  );
}

function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/profile", { method: "DELETE", body: { confirm } });
      onDeleted();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-muted">Type DELETE to confirm. Everything goes immediately.</p>
      <Field label="Confirmation" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error ?? undefined} autoComplete="off" />
      <Button type="submit" variant="accent" disabled={confirm !== "DELETE"} loading={busy}>Delete permanently</Button>
    </form>
  );
}
