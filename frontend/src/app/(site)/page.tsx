import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { DemoButton } from "@/components/landing/DemoButtons";
import { HeroCanvas } from "@/components/landing/HeroCanvas";
import { AvatarPlayground, BondExplorer, RevealDemo, VibeDemo, WyrDemo } from "@/components/landing/Playground";
import { DeadChatArt, OvershareArt, SwipeArt } from "@/components/landing/ProblemArt";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { ACTIVITIES, CATEGORIES } from "@/lib/activities";

export const metadata: Metadata = {
  title: { absolute: "SaathVerse: Two worlds. One connection." },
  description:
    "Meet people by doing things together: deep talk, games, drawing, a shared 3D constellation and watching together. Vibe Match explains every score, bonds grow from real moments, and your profile opens up only as you choose.",
};

const PROBLEMS = [
  { title: "Judged in half a second", body: "Most apps ask you to decide on a photo. People are so much more than their best angle, and the swiping wears everyone out.", Art: SwipeArt },
  { title: "“hey”, and then silence", body: "A match is not a conversation. Without something to do together, chats stall after two messages and nobody knows what to say.", Art: DeadChatArt },
  { title: "Everything, all at once", body: "Profiles ask for your job, your habits and your socials on day one, before you know if this person is kind.", Art: OvershareArt },
];

const STEPS = [
  { n: 1, title: "Design your planet", body: "No photos. Build an avatar from shape, color, rings, surface and mood, then add prompts and a short Vibe Quiz.", icon: "sparkle" },
  { n: 2, title: "Find your vibe", body: "Discover shows people who fit what you want. Every Vibe Match score shows exactly why: shared interests, intent, quiz answers, lifestyle.", icon: "discover" },
  { n: 3, title: "Do something together", body: "Skip the small talk. Pick Talk, Play, Create or Watch. Games are personalised to what you both like.", icon: "orbit" },
  { n: 4, title: "Grow a bond, reveal at your pace", body: "Every moment adds bond points. Levels unlock more of each other's profile, only for the sections you allow.", icon: "heart" },
];

const SAFETY = [
  { icon: "flag", title: "Report with context", body: "Choose a reason and, only if you want, attach the last messages so moderators can see what happened." },
  { icon: "lock", title: "Block in one tap", body: "Blocked people disappear from Discover, chats and tables. You can unblock from Settings." },
  { icon: "exit", title: "Quick exit", body: "One button leaves any room immediately and takes you somewhere neutral." },
  { icon: "smile", title: "Kindness nudges", body: "Unkind words get a gentle prompt before sending, and sharing a number early shows a safety tip." },
  { icon: "eyeOff", title: "Privacy per section", body: "Basics, lifestyle, work and socials each have their own audience, from everyone to only you." },
  { icon: "shield", title: "Real moderators", body: "Admins review reports, pause or remove accounts, and every action is written to an audit log." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pt-8 pb-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-14">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface/80 px-3 py-1.5 text-sm font-semibold text-violet">
              <Icon name="sparkle" size={16} /> Dating and friendship, built around doing things together
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Two worlds. <span className="text-violet italic">One connection.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              SaathVerse means a universe of togetherness. Instead of judging photos, you meet over a game, a deep question, a drawing or a song.
              Your bond grows from what you share, and your profile opens up only as you choose.
            </p>
            <div className="mt-8 flex flex-wrap items-start gap-3">
              <ButtonLink href="/signup" size="lg">Create your planet <Icon name="arrowRight" size={18} /></ButtonLink>
              <DemoButton as="user" size="lg">Try the live demo</DemoButton>
            </div>
            <p className="mt-4 text-sm text-muted">
              Free. 18+ only. Running this for a team? <Link href="/login?as=admin" className="font-semibold text-violet underline-offset-4 hover:underline">Admin sign in</Link>
            </p>
          </div>
          <div className="relative">
            <HeroCanvas />
            <div className="pointer-events-none absolute top-6 left-0 hidden animate-float rounded-2xl border border-line bg-surface/90 px-3 py-2 text-sm shadow-[var(--shadow)] backdrop-blur sm:block" aria-hidden="true">
              <span className="font-bold text-violet">Vibe 86</span> <span className="text-muted">You both love astronomy</span>
            </div>
            <div className="pointer-events-none absolute right-2 bottom-10 hidden animate-float rounded-2xl border border-line bg-surface/90 px-3 py-2 text-sm shadow-[var(--shadow)] backdrop-blur [animation-delay:1.5s] sm:block" aria-hidden="true">
              <span className="font-bold text-rose">Bond: Orbit</span> <span className="text-muted">4 day streak</span>
            </div>
          </div>
        </div>
        <div className="overflow-hidden border-y border-line bg-surface/60 py-3 backdrop-blur-sm" aria-hidden="true">
          <div className="marquee flex w-max gap-10 text-sm font-semibold whitespace-nowrap text-muted">
            {[...ACTIVITIES, ...ACTIVITIES].map((a, i) => (
              <span key={i} className="flex items-center gap-2"><Icon name={a.id} size={16} className={i % 2 ? "text-rose" : "text-violet"} />{a.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal>
          <p className="font-bold text-rose">The problem</p>
          <h2 className="mt-2 max-w-3xl font-display text-4xl font-semibold text-balance sm:text-5xl">Online dating made meeting people feel like a chore.</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">Problem Statement 06 asks how to make connection an experience. We started from the three moments where it usually breaks.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map(({ title, body, Art }, i) => (
            <Reveal key={title} delay={i * 120}>
              <article className="lift h-full rounded-3xl border border-line bg-surface p-6">
                <Art />
                <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Solution / how */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-surface/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-bold text-violet">The idea</p>
            <h2 className="mt-2 max-w-3xl font-display text-4xl font-semibold text-balance sm:text-5xl">Put the doing first. Let the knowing follow.</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <ol className="relative space-y-6 border-l-2 border-dashed border-line-strong pl-8">
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 100} className="relative">
                  <span className="absolute top-0 -left-[3.05rem] flex h-10 w-10 items-center justify-center rounded-full border-2 border-violet bg-surface font-display font-bold text-violet">{s.n}</span>
                  <h3 className="flex items-center gap-2 font-display text-2xl font-semibold"><Icon name={s.icon} className="text-rose" />{s.title}</h3>
                  <p className="mt-1.5 text-muted">{s.body}</p>
                </Reveal>
              ))}
            </ol>
            <div className="grid gap-5">
              <Reveal><AvatarPlayground /></Reveal>
              <Reveal delay={150}><VibeDemo /></Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section id="activities" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal>
          <p className="font-bold text-rose">Ten things to do together</p>
          <h2 className="mt-2 max-w-3xl font-display text-4xl font-semibold text-balance sm:text-5xl">Talk, play, create or watch. Live, for two.</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">Pick one with someone you are connected to, open a table for someone new, or let Quick Match find you a partner for the same activity.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.id} delay={i * 90}>
                <article className="lift h-full rounded-3xl border border-line bg-surface p-5">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${i % 2 ? "bg-rose-soft text-rose" : "bg-violet-soft text-violet"}`}><Icon name={c.icon} /></span>
                  <h3 className="mt-3 font-display text-2xl font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted">{c.blurb}</p>
                  <ul className="mt-3 space-y-1.5">
                    {ACTIVITIES.filter((a) => a.category === c.id).map((a) => (
                      <li key={a.id} className="flex items-center gap-2 text-sm font-semibold"><Icon name={a.id} size={16} className="text-muted" />{a.name}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}><WyrDemo /></Reveal>
        </div>
      </section>

      {/* Bond */}
      <section id="bond" className="scroll-mt-20 border-y border-line bg-surface/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-bold text-violet">Bonds you can see</p>
            <h2 className="mt-2 max-w-3xl font-display text-4xl font-semibold text-balance sm:text-5xl">From Stardust to Galaxy, earned one moment at a time.</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted">Vibe Match tells you how well two profiles line up. Bond tells you how much you have actually shared. Together they help you decide who is worth more of your time.</p>
          </Reveal>
          <div className="mt-12"><Reveal><BondExplorer /></Reveal></div>
        </div>
      </section>

      {/* Safety and privacy */}
      <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <p className="font-bold text-rose">Private by default</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-balance sm:text-5xl">Reveal yourself at your own pace.</h2>
            <p className="mt-4 text-lg text-muted">Drag the slider to see how a profile opens up. Every section has its own audience, and you can download or delete your data at any time.</p>
            <div className="mt-6"><RevealDemo /></div>
          </Reveal>
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {SAFETY.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <article className="lift h-full rounded-2xl border border-line bg-surface p-5">
                  <Icon name={s.icon} className={i % 2 ? "text-rose" : "text-violet"} />
                  <h3 className="mt-2 font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted">{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action, with both sign in paths */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-surface p-8 sm:p-12">
            <div className="pointer-events-none absolute -top-10 -right-10 opacity-60" aria-hidden="true"><LogoMark size={260} live title="" /></div>
            <h2 className="relative max-w-2xl font-display text-4xl font-semibold text-balance sm:text-5xl">Ready to find someone in your orbit?</h2>
            <p className="relative mt-3 max-w-xl text-lg text-muted">Create a free account, or step into a demo account that already has connections, moments and bonds to explore.</p>
            <div className="relative mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-paper p-5">
                <p className="flex items-center gap-2 font-bold"><Icon name="heart" className="text-violet" /> For members</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ButtonLink href="/signup">Join free</ButtonLink>
                  <ButtonLink href="/login" variant="secondary">Sign in</ButtonLink>
                  <DemoButton as="user" variant="soft">Member demo</DemoButton>
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-5">
                <p className="flex items-center gap-2 font-bold"><Icon name="shield" className="text-rose" /> For admins and moderators</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ButtonLink href="/login?as=admin" variant="accent">Admin sign in</ButtonLink>
                  <ButtonLink href="/signup?as=admin" variant="secondary">Join with invite</ButtonLink>
                  <DemoButton as="admin" variant="soft">Admin demo</DemoButton>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
