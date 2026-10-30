import { RailHero } from "@/components/rail/RailHero";
import { RailStraight } from "@/components/rail/RailStraight";
import { LookRunway } from "@/components/look/LookRunway";
import { Orbit } from "@/components/orbit/Orbit";
import { Statement } from "@/components/home/Statement";
import { EditorialSlider } from "@/components/home/EditorialSlider";
import { GalleryStrip } from "@/components/home/GalleryStrip";

export default function HomePage() {
  return (
    <>
      <RailHero />
      <RailStraight />
      <LookRunway />
      <Orbit />
      <Statement title="Obsessed.">
        We make things that work better and last longer. Heavy cotton, honest seams and colours that stay put, wash after
        wash.
      </Statement>
      <EditorialSlider />
      <GalleryStrip title="New season. No limits." />
    </>
  );
}
