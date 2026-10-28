import type { Metadata } from "next";
import { Suspense } from "react";
import { Chats } from "@/components/app/Chats";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = { title: "Chats" };

export default function ChatsPage() {
  return (
    <Suspense fallback={<PageLoader variant="chat" caption="Opening your conversations" />}>
      <Chats />
    </Suspense>
  );
}
