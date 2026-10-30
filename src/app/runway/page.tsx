import type { Metadata } from "next";
import { LookRunway } from "@/components/look/LookRunway";

export const metadata: Metadata = {
  title: "Runway",
  description: "Six looks, styled head to toe. Add a single piece or the full look and save 10%.",
};

export default function RunwayPage() {
  return <LookRunway title="Shop the Look." as="h1" />;
}
