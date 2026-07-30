import type { Metadata } from "next";
import { RoadmapPrototype } from "./RoadmapPrototype";

export const metadata: Metadata = {
  title: "Cabina futuro · Serate Film",
  description: "Prototipo delle opportunità di prodotto per Serate Film.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const { variant } = await searchParams;
  const initialVariant = variant === "B" || variant === "C" ? variant : "A";

  return <RoadmapPrototype initialVariant={initialVariant} />;
}
