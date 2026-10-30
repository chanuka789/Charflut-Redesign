import type { Metadata } from "next";
import { Orbit } from "@/components/orbit/Orbit";

export const metadata: Metadata = {
  title: "Orbit",
  description: "Turn the wheel to browse every piece, then pick your size.",
};

export default function OrbitPage() {
  return <Orbit as="h1" />;
}
