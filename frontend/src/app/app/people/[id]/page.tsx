import type { Metadata } from "next";
import { PersonPage } from "@/components/app/PersonPage";

export const metadata: Metadata = { title: "Profile" };

export default async function PersonRoute({ params }: PageProps<"/app/people/[id]">) {
  const { id } = await params;
  return <PersonPage id={Number(id)} />;
}
