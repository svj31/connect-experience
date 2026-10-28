import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The rules for using SaathVerse, what you can expect from us, and what we expect from you.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Prose title="Terms and conditions" updated="28 October 2026" intro="By creating an account or using SaathVerse you agree to these terms. They are written to be read, so please do.">
      <h2>1. Who can use SaathVerse</h2>
      <p>You must be at least 18 years old and able to agree to these terms. One person, one account.</p>

      <h2>2. Your account</h2>
      <p>Keep your password private. You are responsible for what happens under your account. Tell us through the <Link href="/contact">contact page</Link> if you think someone else has access.</p>

      <h2>3. How to behave</h2>
      <p>SaathVerse works because people show up in good faith. You agree not to:</p>
      <ul>
        <li>Harass, threaten, demean or stalk anyone, inside or outside a table.</li>
        <li>Share sexual content, or any content involving minors.</li>
        <li>Pretend to be someone else, or misrepresent your age.</li>
        <li>Send spam, sell things, or ask for money.</li>
        <li>Pressure anyone to reveal more than they chose to, or to move to another platform.</li>
        <li>Load videos in Watch Together that you do not have the right to share, or that break YouTube&apos;s terms.</li>
        <li>Try to break, overload, scrape or reverse engineer the service.</li>
      </ul>

      <h2>4. What you create</h2>
      <p>
        Drawings, stories, constellation names and messages belong to the people who made them. You give SaathVerse a limited
        licence to store and display them to the people at your table, so the service can work. Shared moments are visible to
        both people who made them.
      </p>

      <h2>5. Safety and enforcement</h2>
      <p>
        We may remove content, close tables or suspend accounts that break these terms, and we review reports of underage
        users first. Use report and block inside any table. Blocking is immediate and permanent between the two accounts.
      </p>

      <h2>6. Meeting in person</h2>
      <p>
        SaathVerse is an online space. If you decide to meet someone offline, you do so at your own risk. Read our{" "}
        <Link href="/safety">safety guide</Link> first.
      </p>

      <h2>7. The service</h2>
      <p>
        SaathVerse is provided as it is. We work to keep it available and secure, but cannot promise it will always be free of
        interruptions or errors. To the extent the law allows, we are not liable for indirect losses arising from its use.
      </p>

      <h2>8. Ending your account</h2>
      <p>You can delete your account at any time from your profile. We may close accounts that break these terms.</p>

      <h2>9. Changes</h2>
      <p>If we change these terms in a way that matters, we will tell you in the app before the change takes effect.</p>

      <h2>10. Contact</h2>
      <p>Questions about these terms: use the <Link href="/contact">contact form</Link>.</p>
    </Prose>
  );
}
