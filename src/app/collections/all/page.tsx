import type { Metadata } from "next";
import { CollectionGrid } from "@/components/collection/CollectionGrid";

export const metadata: Metadata = {
  title: "Products",
  description: "Every colour of every piece: hoodies, tees and cargos in heavyweight cotton.",
};

export default function CollectionPage() {
  return <CollectionGrid />;
}
