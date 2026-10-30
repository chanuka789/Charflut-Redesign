import type { Metadata } from "next";
import { RailHero } from "@/components/rail/RailHero";
import { RailStraight } from "@/components/rail/RailStraight";

export const metadata: Metadata = {
  title: "Hand Rail",
  description: "Every colour on one rail. Hover a piece, click to look closer.",
};

export default function HandRailPage() {
  return (
    <>
      <RailHero scene="sky" />
      <RailStraight />
    </>
  );
}
