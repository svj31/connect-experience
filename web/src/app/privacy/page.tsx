import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieBanner";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Overlap collects, why, how long we keep it, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Prose title="Privacy policy" updated="27 October 2026" intro="We built Overlap so that people reveal themselves gradually and on their own terms. Our handling of your data follows the same idea: collect little, show less, and let you delete it.">
      <h2 id="what">What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your email address, a hashed password (we never store the password itself) and the name you choose.</li>
        <li><strong>Profile:</strong> pronouns, interests, avatar shape and color, and optionally a bio and a handle.</li>
        <li><strong>Activity at tables:</strong> chat messages, game answers, drawings, stories, constellations and the moments saved from them.</li>
        <li><strong>Safety records:</strong> blocks and reports you make, including the reason and any details you add.</li>
        <li><strong>Contact form messages:</strong> your name, email and message.</li>
        <li><strong>Analytics, only with consent:</strong> an event name and the page path, with room codes removed. No name, email, IP address or device identifier is stored with it.</li>
      </ul>

      <h2 id="use">How we use it</h2>
      <ul>
        <li>To run the service: sign you in, seat you at tables, sync activities, and deliver chat.</li>
        <li>To show your partner only what you chose to reveal at that table.</li>
        <li>To build Common Ground, which compares answers the two of you gave at the same table. It is never shared with anyone else.</li>
        <li>To match you in Quick Match using your chosen activity and interests.</li>
        <li>To keep people safe: reviewing reports, enforcing blocks and limiting abuse.</li>
      </ul>
      <p>We do not sell your data, show advertising, or use your conversations to train AI models.</p>

      <h2 id="visible">Who can see what</h2>
      <p>
        A person at your table sees your name, pronouns, interests and avatar. They see your bio only after you choose reveal
        level 1 at that table, and your handle only after you choose level 2. Your email is never shown to anyone.
      </p>

      <h2 id="cookies">Cookies and local storage</h2>
      <ul>
        <li><strong>ovl_session</strong> (essential): an httpOnly cookie that keeps you signed in for up to 14 days. It cannot be read by scripts on the page.</li>
        <li><strong>ovl_consent</strong> (local storage): remembers whether you accepted analytics.</li>
      </ul>
      <p>We do not use advertising or third party tracking cookies. If you load a YouTube video in Watch Together, YouTube may set its own cookies under its own policy.</p>
      <div className="not-prose"><CookieSettingsButton /></div>

      <h2 id="retention">How long we keep it</h2>
      <p>
        We keep your account data until you delete your account. Analytics events are summarised over 30 days. Reports are kept
        as long as needed to keep the community safe, even after an account is deleted.
      </p>

      <h2 id="rights">Your choices and rights</h2>
      <ul>
        <li>Edit your profile at any time on the <Link href="/profile">profile page</Link>.</li>
        <li>Lower your reveal level at any table, at any time.</li>
        <li>Delete your account from the profile page. This removes your profile, the tables you host, your messages and your moments immediately.</li>
        <li>Ask for a copy of your data or raise a concern through the <Link href="/contact">contact page</Link>.</li>
      </ul>

      <h2 id="security">Security</h2>
      <p>
        Passwords are hashed with bcrypt. Sessions are signed tokens in httpOnly cookies. Traffic is served over HTTPS in
        production, and sign in, sign up, chat and forms are rate limited.
      </p>

      <h2 id="age">Age</h2>
      <p>Overlap is only for people aged 18 and over. If you believe someone under 18 is using it, report them from the table or contact us.</p>

      <h2 id="contact">Contact</h2>
      <p>Questions about this policy: use the <Link href="/contact">contact form</Link> or write to {SITE.contactEmail}.</p>
    </Prose>
  );
}
