import Link from "next/link";
import { HeroCanvas } from "@/components/landing/HeroCanvas";
import { PrimaryCta } from "@/components/landing/PrimaryCta";
import { TableDemo } from "@/components/landing/TableDemo";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { ACTIVITIES } from "@/lib/activities";

const STEPS = [
  {
    title: "Pick something to do",
    body: "Open the lobby and sit at a table someone started, or start one with the activity you feel like. Quick Match finds a partner who picked the same thing.",
    icon: "compass",
  },
  {
    title: "Do it together, live",
    body: "Play, draw, write or watch on a shared screen with chat on the side. Every finished round becomes a moment you both keep.",
    icon: "users",
  },
  {
    title: "Open up when it feels right",
    body: "Your bio and handle stay hidden until you choose to share them. Common Ground shows where you agreed and gives you something real to talk about.",
    icon: "eye",
  },
];

const SAFETY = [
  { title: "No photo grid", body: "Avatars are shapes and colors you choose. Nobody is judged in half a second." },
  { title: "Report and block in one tap", body: "From inside any table. A blocked person can never be seated with you again." },
  { title: "You hold the reveal", body: "Nothing beyond your first name and interests is shown until you decide." },
  { title: "Adults only", body: "Every account confirms they are 18 or over. Reports of underage users are reviewed first." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-16 lg:pb-24">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-bold tracking-widest text-muted uppercase">
            <span className="h-2 w-2 rounded-full bg-coral" aria-hidden="true" /> Interactive dating
          </p>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Meet over something you both enjoy.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Overlap seats two people at a live table to play a game, draw on one canvas, write a story or watch a video together.
            You learn about each other from what you do, and profiles open up only as you both choose.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryCta />
            <Link href="#activities" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              See the nine activities
            </Link>
          </div>
        </div>
        <div className="relative aspect-square w-full max-w-[520px] justify-self-center">
          <HeroCanvas />
        </div>
      </section>

      {/* Try it */}
      <section aria-labelledby="try-heading" className="border-y border-line bg-paper-deep">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 id="try-heading" className="font-display text-3xl font-semibold sm:text-4xl">What a table feels like</h2>
            <p className="mt-2 max-w-2xl text-muted">Two small pieces of the real thing. Make a pick, then slide through what an example player has chosen to share.</p>
          </Reveal>
          <Reveal delay={100} className="mt-8">
            <TableDemo />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-heading" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal>
          <h2 id="how-heading" className="font-display text-3xl font-semibold sm:text-4xl">How it works</h2>
        </Reveal>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 100} className="relative rounded-lg border border-line bg-surface p-6">
              <span className="font-display text-5xl font-semibold text-line-strong" aria-hidden="true">{i + 1}</span>
              <span className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-md bg-paper-deep text-ink">
                <Icon name={step.icon} />
              </span>
              <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Activities */}
      <section id="activities" aria-labelledby="activities-heading" className="scroll-mt-20 border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 id="activities-heading" className="font-display text-3xl font-semibold sm:text-4xl">Nine things to do together</h2>
            <p className="mt-2 max-w-2xl text-muted">Switch between them any time at the same table. Each one runs live for both of you.</p>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVITIES.map((a, i) => (
              <Reveal as="li" key={a.id} delay={(i % 3) * 80}>
                <article className="group h-full rounded-lg border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-1 hover:border-ink hover:bg-surface">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-md ${i % 2 ? "bg-teal-soft text-teal-dark" : "bg-coral-soft text-coral-dark"}`}>
                      <Icon name={a.id} size={22} />
                    </span>
                    <span className="text-xs font-bold tracking-widest text-muted uppercase">{a.kind}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{a.name}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{a.long}</p>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Common ground + safety */}
      <section aria-labelledby="ground-heading" className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <h2 id="ground-heading" className="font-display text-3xl font-semibold sm:text-4xl">Common Ground, from real answers</h2>
          <p className="mt-3 leading-relaxed text-muted">
            After a few rounds, open Common Ground at your table. It counts how often you picked the same side, lists the
            interests you share, and turns your answers into conversation starters you can send with one tap. Nothing is
            guessed: every line comes from something one of you actually chose.
          </p>
          <div className="mt-6 rounded-lg border border-line bg-surface p-5">
            <p className="text-sm font-bold tracking-wide text-muted uppercase">Example spark</p>
            <p className="mt-2 font-display text-xl">&ldquo;You chose a mountain cabin and they chose a city you have never visited. Ask what wins it for them.&rdquo;</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Built to feel safe</h2>
          <ul className="mt-6 space-y-4">
            {SAFETY.map((s) => (
              <li key={s.title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal-dark"><Icon name="shield" size={18} /></span>
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/safety" className="mt-6 inline-block font-semibold text-teal underline underline-offset-4">Read the safety guide</Link>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-start justify-between gap-6 rounded-lg bg-ink px-6 py-10 text-white sm:px-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">Your first table takes a minute to set up.</h2>
            <p className="mt-2 text-white/80">Pick an avatar, choose an activity, and wait for someone to sit down.</p>
          </div>
          <PrimaryCta />
        </Reveal>
      </section>
    </>
  );
}
