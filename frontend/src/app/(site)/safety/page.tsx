import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Safety guide",
  description: "How SaathVerse keeps people safe, and what you can do to stay comfortable online and offline.",
  alternates: { canonical: "/safety" },
};

export default function SafetyPage() {
  return (
    <Prose title="Safety guide" intro="You decide how much someone sees, and you can leave any table at any time. Here is how the tools work and some habits that help.">
      <h2>At a table</h2>
      <ul>
        <li><strong>Leave whenever you like.</strong> The Leave button ends your seat immediately. You do not owe anyone an explanation.</li>
        <li><strong>Block.</strong> Open Safety at the top of any table. A blocked person can never be seated with you again and will not see your open tables.</li>
        <li><strong>Report.</strong> Choose a reason and add details if you want. Reporting also blocks the person.</li>
        <li><strong>Reveal at your pace.</strong> Your bio and handle stay hidden until you choose. You can lower your level again at any time.</li>
      </ul>

      <h2>Signs to watch for</h2>
      <ul>
        <li>Pushing you to reveal your handle or move to another app before you are ready.</li>
        <li>Asking for money, gift cards, or financial details for any reason.</li>
        <li>Stories that change, or reluctance to do anything together at the table.</li>
        <li>Anything suggesting they are under 18. Report it.</li>
      </ul>

      <h2>If you meet offline</h2>
      <ul>
        <li>Meet in a public place and arrange your own transport.</li>
        <li>Tell a friend where you are going and who you are meeting.</li>
        <li>Keep your phone charged and trust your instincts. Leaving early is always fine.</li>
      </ul>

      <h2>Get help</h2>
      <p>
        If you are in immediate danger, contact your local emergency number. For anything that happened on SaathVerse, report it
        from any chat or profile or write to us through the <Link href="/contact">contact page</Link> and choose &ldquo;Safety&rdquo;.
      </p>
    </Prose>
  );
}
