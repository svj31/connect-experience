/* eslint-disable @next/next/no-img-element -- remote demo portraits */
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/Logo";
import { DemoButton } from "@/components/landing/DemoButtons";
import { CROWD, DEMO_FACES, PhoneMockup, crowdPhoto } from "@/components/landing/PhoneMockup";
import { BondExplorer, VibeDemo, WyrDemo } from "@/components/landing/Playground";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { ACTIVITIES, CATEGORIES } from "@/lib/activities";

export const metadata: Metadata = {
  title: { absolute: "SaathVerse: Don't just match. Do something together." },
  description:
    "The dating app where matches turn into moments. Swipe, match, then skip the small talk with deep questions, games, drawing and watching together. Every match explains itself, and your profile opens up as your bond grows.",
};

const STEPS = [
  { n: "01", title: "Swipe on people who fit", body: "A deck ranked by real compatibility, distance and who is active. Every card tells you why you might click.", icon: "fire", face: DEMO_FACES.c },
  { n: "02", title: "Match, then skip the hey", body: "When you both like each other, a private space opens with a game, a question or a film already waiting.", icon: "heart", face: DEMO_FACES.d },
  { n: "03", title: "Grow a bond, reveal more", body: "Every moment together adds to your bond. Higher levels unlock more of each other's profile, only as you allow.", icon: "orbit", face: DEMO_FACES.e },
];

const SAFETY = [
  { icon: "shield", title: "Real moderators", body: "Reports are reviewed by people, and every action is logged." },
  { icon: "lock", title: "Block in one tap", body: "Blocked people vanish from Discover, chats and rooms." },
  { icon: "eyeOff", title: "Privacy per section", body: "Choose who sees your basics, lifestyle, work and socials." },
  { icon: "smile", title: "Kindness nudges", body: "Unkind words get a gentle pause before they are sent." },
  { icon: "pin", title: "City, never GPS", body: "Distance comes from your city. We never store where you are." },
  { icon: "exit", title: "Quick exit", body: "One tap leaves any room and takes you somewhere neutral." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden bg-[#09090c] pt-16 text-white">
        {/* A quiet wall of faces behind the hero, like the big dating sites. */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-4 gap-2 p-2 opacity-[0.16] sm:grid-cols-8" aria-hidden="true">
          {CROWD.map((c) => <img key={c.img} src={crowdPhoto(c.img, 300)} alt="" className="aspect-[3/4] w-full rounded-2xl object-cover" />)}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090c] via-[#09090c]/85 to-[#09090c]/60" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,rgb(255_46_106/0.28),transparent),radial-gradient(40%_40%_at_10%_90%,rgb(255_138_61/0.18),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/85">
              <span className="bg-brand h-2 w-2 rounded-full" /> The dating app for people who hate small talk
            </p>
            <h1 className="mt-6 font-display text-[3.2rem] leading-[0.95] font-extrabold tracking-[-0.04em] text-balance sm:text-7xl lg:text-[5.4rem]">
              Don&apos;t just match. <span className="text-brand">Do something</span> together.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">
              Swipe like you are used to. Then, instead of &ldquo;hey&rdquo;, play a game, answer a deep question or watch something together.
              Your bond grows with every moment, and so does what you see of each other.
            </p>
            <div className="mt-9 flex flex-wrap items-start gap-3">
              <ButtonLink href="/signup" size="lg">Create account <Icon name="arrowRight" size={18} /></ButtonLink>
              <DemoButton as="user" size="lg" variant="accent" className="[&_button]:bg-white [&_button]:text-[#111] [&_button]:border-white">Try the live demo</DemoButton>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <span className="flex -space-x-3">
                {[DEMO_FACES.a, DEMO_FACES.b, DEMO_FACES.c, DEMO_FACES.d, DEMO_FACES.e].map((f) => (
                  <img key={f} src={f} alt="" className="h-10 w-10 rounded-full border-2 border-[#09090c] object-cover" />
                ))}
              </span>
              <p className="text-sm text-white/70">Free to join. 10 things to do together.<br />No paid tiers, no hidden likes.</p>
            </div>
          </div>
          <div className="animate-rise [animation-delay:150ms]"><PhoneMockup /></div>
        </div>
        <div className="relative border-y border-white/10 bg-white/[0.03] py-4">
          <div className="marquee flex w-max gap-10 whitespace-nowrap text-lg font-extrabold text-white/60">
            {[...ACTIVITIES, ...ACTIVITIES].map((a, i) => (
              <span key={`${a.id}-${i}`} className="flex items-center gap-3"><Icon name={a.id} size={20} className="text-[#ff7a5c]" />{a.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 pb-16 sm:px-6">
        <Reveal>
          <p className="text-brand text-sm font-extrabold tracking-[0.2em] uppercase">How it works</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">From swipe to first date, without the dead chat.</h2>
        </Reveal>
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <li className="group relative h-full overflow-hidden rounded-[28px] bg-[#111116] text-white">
                <img src={s.face} alt="" className="h-64 w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-t from-[#111116] to-transparent" />
                <span className="bg-brand absolute top-4 left-4 flex h-11 w-11 items-center justify-center rounded-2xl"><Icon name={s.icon} size={20} /></span>
                <div className="relative -mt-10 p-6">
                  <p className="font-display text-sm font-extrabold text-white/50">{s.n}</p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold">{s.title}</h3>
                  <p className="mt-2 text-white/70">{s.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Crowd */}
      <section aria-labelledby="crowd-title" className="overflow-hidden pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-brand text-sm font-extrabold tracking-[0.2em] uppercase">Near you</p>
            <h2 id="crowd-title" className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">Real people, one swipe away.</h2>
          </Reveal>
        </div>
        <div className="marquee mt-10 flex w-max gap-4 px-4">
          {[...CROWD, ...CROWD].map((c, i) => (
            <figure key={`${c.img}-${i}`} className="relative h-72 w-52 shrink-0 overflow-hidden rounded-[24px] bg-paper-deep">
              <img src={crowdPhoto(c.img, 500)} alt="" loading="lazy" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-14 text-white">
                <span className="block font-display text-xl font-extrabold">{c.name} <span className="font-semibold text-white/85">{c.age}</span></span>
                <span className="flex items-center gap-1 text-xs font-semibold text-white/80"><Icon name="pin" size={12} />{c.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Sample profiles shown for the demo.</p>
      </section>

      {/* Vibe */}
      <section id="features" className="scroll-mt-20 bg-paper-deep">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="text-brand text-sm font-extrabold tracking-[0.2em] uppercase">Vibe Match</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">Matches that explain themselves.</h2>
            <p className="mt-5 text-lg text-muted">No mystery algorithm. Every score shows its reasons: shared interests, what you are both looking for, quiz answers and lifestyle. Try it, pick a few things you love.</p>
            <ul className="mt-6 space-y-3 font-semibold">
              {["Ranked by compatibility, distance and who is active", "People who liked you show up sooner", "Undo a pass, super like the ones you really mean"].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="bg-brand flex h-6 w-6 items-center justify-center rounded-full"><Icon name="check" size={14} /></span>{t}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}><VibeDemo /></Reveal>
        </div>
      </section>

      {/* Activities */}
      <section id="activities" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal>
          <p className="text-brand text-sm font-extrabold tracking-[0.2em] uppercase">Together</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">Ten ways to break the ice. All live, all for two.</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <div className="lift h-full rounded-[24px] border border-line bg-surface p-6">
                <span className="bg-brand shadow-brand flex h-12 w-12 items-center justify-center rounded-2xl"><Icon name={c.icon} size={22} /></span>
                <h3 className="mt-5 font-display text-2xl font-extrabold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted">{c.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {ACTIVITIES.filter((a) => a.category === c.id).map((a) => (
                    <li key={a.id} className="rounded-full bg-paper-deep px-3 py-1 text-xs font-bold">{a.name}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10"><Reveal><WyrDemo /></Reveal></div>
      </section>

      {/* Bond */}
      <section id="bond" className="scroll-mt-20 bg-[#09090c] text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <p className="text-brand text-sm font-extrabold tracking-[0.2em] uppercase">Bond levels</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">Earn the reveal.</h2>
            <p className="mt-5 max-w-2xl text-lg text-white/70">From Stardust to Galaxy, your bond grows with every game, answer and conversation. Each level can unlock more of your profile: you choose what, and for whom.</p>
          </Reveal>
          <div className="mt-12 rounded-[28px] bg-surface p-4 text-ink sm:p-8"><Reveal><BondExplorer /></Reveal></div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal>
          <p className="text-brand text-sm font-extrabold tracking-[0.2em] uppercase">Safety</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">Built to feel safe from the first swipe.</h2>
        </Reveal>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <li className="flex h-full gap-4 rounded-[24px] border border-line bg-surface p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-soft text-violet"><Icon name={s.icon} size={20} /></span>
                <span>
                  <span className="block font-display text-lg font-extrabold">{s.title}</span>
                  <span className="mt-1 block text-sm text-muted">{s.body}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="bg-brand relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <LogoMark size={64} title="" className="mx-auto shadow-[0_10px_30px_-8px_rgb(0_0_0/0.35)] rounded-[18px]" />
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">Your next first date starts with a game.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Join free, or look around with a demo account in one click.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/signup" size="lg" variant="accent" className="!bg-white !text-[#111] !border-white">Create account</ButtonLink>
            <DemoButton as="user" size="lg" variant="accent">Member demo</DemoButton>
            <DemoButton as="admin" size="lg" variant="ghost" className="[&_button]:text-white [&_button:hover]:bg-white/15">Admin demo</DemoButton>
          </div>
        </div>
      </section>
    </>
  );
}
