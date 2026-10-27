import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send feedback, a safety concern or a privacy request to the Overlap team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Prose title="Contact us" intro="Feedback, a safety concern, or a question about your data. A person reads every message.">
      <ContactForm />
    </Prose>
  );
}
