/* eslint-disable @next/next/no-img-element -- remote demo portraits */
import type { Metadata } from "next";
import { DemoButton } from "@/components/landing/DemoButtons";
import { CROWD, DEMO_FACES, crowdPhoto } from "@/components/landing/PhoneMockup";
import { BondExplorer, VibeDemo, WyrDemo } from "@/components/landing/Playground";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { ACTIVITIES, CATEGORIES } from "@/lib/activities";

export const metadata: Metadata = {
  title: { absolute: "SaathVerse: Don't just match. Do something together." },
  description:
    "The dating app where matches turn into moments. Like a photo or a prompt, match, then skip the small talk with deep questions, games, drawing and watching together. Every match explains itself.",
};

const STEPS = [
  { n: "1", title: "Like what you love about them", body: "Every photo and prompt has a heart. Like the one that caught your eye, add a line, and start with something real.", face: DEMO_FACES.c },
  { n: "2", title: "Match, then skip the small talk", body: "When you both like each other, a private space opens with a game, a deep question or a film already waiting.", face: DEMO_FACES.d },
  { n: "3", title: "Grow a bond, reveal more", body: "Every moment together adds to your bond. Higher levels unlock more of each other's profile, only as you allow.", face: DEMO_FACES.e },
];

const SAFETY = [
  { icon: "shield", title: "Real moderators", body: "Reports are reviewed by people, and every action is logged." },
  { icon: "lock", title: "Block in one tap", body: "Blocked people vanish from Discover, chats and rooms." },
  { icon: "eyeOff", title: "Privacy per section", body: "Choose who sees your basics, lifestyle, work and socials." },
  { icon: "smile", title: "Kindness nudges", body: "Unkind words get a gentle pause before they are sent." },
  { icon: "pin", title: "City, never GPS", body: "Distance comes from your city. We never store where you are." },
  { icon: "exit", title: "Quick exit", body: "One tap leaves any room and takes you somewhere neutral." },
];

const eyebrow = "text-sm font-semibold tracking-[0.18em] text-violet uppercase";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-28">
          <div className="animate-rise">
            <p className={eyebrow}>The dating app for people who hate small talk</p>
            <h1 className="mt-5 font-display text-[3.3rem] leading-[0.98] text-balance sm:text-7xl lg:text-[5.6rem]">
              Don&apos;t just match. <span className="italic text-violet">Do something</span> together.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Like a photo or a prompt that speaks to you. When it&apos;s mutual, skip the &ldquo;hey&rdquo; and play a game, answer a deep question or watch something together.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/signup" size="lg">Create account</ButtonLink>
              <DemoButton as="user" size="lg" variant="secondary">Try the live demo</DemoButton>
            </div>
            <a href="/login#demo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet underline-offset-4 hover:underline">Or pick a demo person to be <Icon name="arrowRight" size={15} /></a>
            <div className="mt-10 flex items-center gap-4">
              <span className="flex -space-x-3">
                {CROWD.slice(0, 5).map((c) => <img key={c.img} src={crowdPhoto(c.img, 120)} alt="" className="h-10 w-10 rounded-full border-2 border-paper object-cover" />)}
              </span>
              <p className="text-sm text-muted">Free to join. Ten things to do together.<br />No paid tiers, no hidden likes.</p>
            </div>
          </div>

          {/* Editorial photo collage with a prompt, like a real profile */}
          <div className="animate-rise relative mx-auto h-[520px] w-full max-w-[460px] [animation-delay:150ms] sm:h-[580px]" aria-hidden="true">
            <img src={DEMO_FACES.a} alt="" className="absolute top-0 left-0 h-[64%] w-[62%] rounded-[28px] object-cover shadow-[var(--shadow)]" />
            <img src={DEMO_FACES.b} alt="" className="absolute right-0 bottom-0 h-[62%] w-[58%] rounded-[28px] object-cover shadow-[var(--shadow)]" />
            <div className="absolute top-[14%] right-0 w-[52%] rounded-[22px] border border-line bg-surface p-5 shadow-[var(--shadow)]">
              <p className="text-xs font-semibold">My ideal first date</p>
              <p className="mt-2 font-display text-[1.35rem] leading-snug">Street food crawl, then losing at Connect Four</p>
              <span className="mt-3 ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-line text-violet"><Icon name="heart" size={16} /></span>
            </div>
            <div className="absolute bottom-[10%] left-0 flex items-center gap-3 rounded-full border border-line bg-surface py-2 pr-5 pl-2 shadow-[var(--shadow)]">
              <span className="flex -space-x-2">
                <img src={DEMO_FACES.a} alt="" className="h-9 w-9 rounded-full border-2 border-surface object-cover" />
                <img src={DEMO_FACES.b} alt="" className="h-9 w-9 rounded-full border-2 border-surface object-cover" />
              </span>
              <span className="text-sm leading-tight font-semibold">It&apos;s a Saath!<span className="block text-xs font-normal text-muted">Connect Four is waiting</span></span>
            </div>
            <span className="bg-saffron absolute top-[58%] left-[48%] flex h-12 w-12 items-center justify-center rounded-full shadow-[var(--shadow)]"><Icon name="star" size={20} /></span>
          </div>
        </div>
        <div className="border-y border-line bg-surface py-4">
          <div className="marquee flex w-max gap-10 whitespace-nowrap font-display text-xl text-muted">
            {[...ACTIVITIES, ...ACTIVITIES].map((a, i) => (
              <span key={`${a.id}-${i}`} className="flex items-center gap-3"><Icon name={a.id} size={18} className="text-violet" />{a.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 pb-16 sm:px-6">
        <Reveal>
          <p className={eyebrow}>How it works</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl text-balance sm:text-6xl">From a like to a first date, without the dead chat.</h2>
        </Reveal>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <li className="h-full overflow-hidden rounded-[24px] border border-line bg-surface">
                <img src={s.face} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-6">
                  <p className="font-display text-lg text-muted italic">Step {s.n}</p>
                  <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
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
            <p className={eyebrow}>Near you</p>
            <h2 id="crowd-title" className="mt-3 max-w-3xl font-display text-4xl text-balance sm:text-5xl">Real people, one like away.</h2>
          </Reveal>
        </div>
        <div className="marquee mt-10 flex w-max gap-4 px-4">
          {[...CROWD, ...CROWD].map((c, i) => (
            <figure key={`${c.img}-${i}`} className="relative h-72 w-52 shrink-0 overflow-hidden rounded-[24px] bg-paper-deep">
              <img src={crowdPhoto(c.img, 500)} alt="" loading="lazy" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-14 text-white">
                <span className="block font-display text-2xl">{c.name}, {c.age}</span>
                <span className="flex items-center gap-1 text-xs text-white/85"><Icon name="pin" size={12} />{c.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Sample profiles shown for the demo.</p>
      </section>

      {/* Vibe */}
      <section id="features" className="scroll-mt-20 border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className={eyebrow}>Vibe Match</p>
            <h2 className="mt-3 font-display text-4xl text-balance sm:text-5xl">Matches that explain themselves.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">No mystery algorithm. Every score shows its reasons: shared interests, what you are both looking for, quiz answers and lifestyle. Each day, Standouts picks the people who fit you best.</p>
            <ul className="mt-6 space-y-3">
              {["Ranked by compatibility, distance and who is active", "People who liked you show up sooner", "Undo a pass, super like the one you really mean"].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="bg-brand flex h-6 w-6 shrink-0 items-center justify-center rounded-full"><Icon name="check" size={14} /></span>{t}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}><VibeDemo /></Reveal>
        </div>
      </section>

      {/* Activities */}
      <section id="activities" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal>
          <p className={eyebrow}>Together</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl text-balance sm:text-6xl">Ten ways to break the ice. All live, all for two.</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <div className="lift h-full rounded-[24px] border border-line bg-surface p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-soft text-violet"><Icon name={c.icon} size={22} /></span>
                <h3 className="mt-5 font-display text-2xl">{c.name}</h3>
                <p className="mt-1 text-sm text-muted">{c.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {ACTIVITIES.filter((a) => a.category === c.id).map((a) => <li key={a.id} className="rounded-full border border-line px-3 py-1 text-xs font-medium">{a.name}</li>)}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10"><Reveal><WyrDemo /></Reveal></div>
      </section>

      {/* Bond */}
      <section id="bond" className="scroll-mt-20 bg-[#161412] text-[#f4f1ec]">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold tracking-[0.18em] text-[#c4a8f0] uppercase">Bond levels</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl text-balance sm:text-6xl">Earn the <span className="italic">reveal.</span></h2>
            <p className="mt-5 max-w-2xl text-lg text-[#f4f1ec]/70">From Stardust to Galaxy, your bond grows with every game, answer and conversation. Each level can unlock more of your profile: you choose what, and for whom.</p>
          </Reveal>
          <div className="mt-12 rounded-[28px] bg-surface p-4 text-ink sm:p-8"><Reveal><BondExplorer /></Reveal></div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal>
          <p className={eyebrow}>Safety</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl text-balance sm:text-6xl">Built to feel safe from the first like.</h2>
        </Reveal>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <li className="flex h-full gap-4 rounded-[24px] border border-line bg-surface p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-soft text-violet"><Icon name={s.icon} size={20} /></span>
                <span>
                  <span className="block font-display text-xl">{s.title}</span>
                  <span className="mt-1 block text-sm text-muted">{s.body}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-[#161412] text-[#f4f1ec] md:grid-cols-[1.2fr_1fr]">
          <div className="p-8 sm:p-14">
            <h2 className="max-w-xl font-display text-4xl text-balance sm:text-6xl">Your next first date starts with a <span className="italic text-[#f2a900]">game.</span></h2>
            <p className="mt-4 max-w-md text-lg text-[#f4f1ec]/75">Join free, or look around with a demo account in one click.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/signup" size="lg" className="!bg-[#f4f1ec] !text-[#161412]">Create account</ButtonLink>
              <DemoButton as="user" size="lg" variant="ghost" className="[&_button]:border-[#f4f1ec]/30 [&_button]:text-[#f4f1ec] [&_button:hover]:bg-white/10">Member demo</DemoButton>
              <DemoButton as="admin" size="lg" variant="ghost" className="[&_button]:text-[#f4f1ec]/80 [&_button:hover]:bg-white/10">Admin demo</DemoButton>
            </div>
          </div>
          <img src={DEMO_FACES.f} alt="" className="hidden h-full w-full object-cover md:block" />
        </div>
      </section>
    </>
  );
}
