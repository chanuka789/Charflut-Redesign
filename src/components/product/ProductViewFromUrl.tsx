"use client";

import { Suspense, useState, type ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import { modelGenders, type ModelGender, type Product } from "@/lib/schema";
import { ProductView } from "./ProductView";

type Props = Omit<ComponentProps<typeof ProductView>, "initialVariant" | "initialGender">;

function resolve(product: Product, color: string | null, model: string | null) {
  const variant = Math.max(0, product.variants.findIndex((v) => v.id === color));
  const gender = modelGenders.includes(model as ModelGender) && product.genders.includes(model as ModelGender)
    ? (model as ModelGender)
    : product.genders[0]!;
  return { variant, gender };
}

function WithParams(props: Props) {
  const params = useSearchParams();
  // Read once: after mount ProductView owns the colour and writes it back to the URL.
  const [initial] = useState(() => resolve(props.product, params.get("color"), params.get("model")));
  return <ProductView {...props} initialVariant={initial.variant} initialGender={initial.gender} />;
}

/**
 * Lets the product page stay a static file. The build renders the default
 * colour as the Suspense fallback; in the browser the real view mounts with
 * the colour and model from ?color= and ?model=.
 */
export function ProductViewFromUrl(props: Props) {
  const fallback = resolve(props.product, null, null);
  return (
    <Suspense fallback={<ProductView {...props} initialVariant={fallback.variant} initialGender={fallback.gender} />}>
      <WithParams {...props} />
    </Suspense>
  );
}
