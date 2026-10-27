"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { validateContact, type Errors } from "@/lib/validation";
import { Button } from "./ui/Button";
import { Field, FormError, Honeypot, TextArea } from "./ui/Field";
import { Icon } from "./ui/Icon";

const TOPICS = [
  { value: "feedback", label: "Feedback or an idea" },
  { value: "safety", label: "Safety" },
  { value: "privacy", label: "Privacy or my data" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [values, setValues] = useState({ name: "", email: "", topic: "feedback", message: "" });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError(null);
    try {
      await api("/contact", { body: { ...values, website, startedAt: startedAt.current } });
      track("contact_sent");
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="animate-pop rounded-lg border border-teal/40 bg-teal-soft p-6">
        <p className="flex items-center gap-2 font-display text-2xl font-semibold text-teal-dark"><Icon name="check" /> Message received</p>
        <p className="mt-1">Thanks, {values.name.split(" ")[0]}. We will reply to {values.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-4 rounded-lg border border-line bg-surface p-6">
      <FormError message={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" autoComplete="name" value={values.name} onChange={(e) => set("name")(e.target.value)} error={errors.name} maxLength={60} />
        <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} />
      </div>
      <div>
        <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-semibold">Topic</label>
        <select id="contact-topic" value={values.topic} onChange={(e) => set("topic")(e.target.value)} className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 focus:border-teal focus:outline-none">
          {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <TextArea label="Message" value={values.message} onChange={(e) => set("message")(e.target.value)} error={errors.message} maxLength={2000} hint={`${values.message.trim().length} of 2000 characters`} />
      <Honeypot value={website} onChange={setWebsite} />
      <Button type="submit" loading={busy}>Send message</Button>
    </form>
  );
}
