import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/catalog";
import { modelGenders, type ModelGender, type Product } from "@/lib/schema";
import { inStock, variantPrice } from "@/lib/product-utils";
import { ProductView } from "@/components/product/ProductView";
import { ProductCard } from "@/components/product/ProductCard";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string | string[]; model?: string | string[] }>;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name} | Charflut`, description: product.summary, type: "website" },
  };
}

function jsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: product.name,
    description: product.description,
    productGroupID: product.slug,
    brand: { "@type": "Brand", name: "Charflut" },
    variesBy: ["https://schema.org/color", "https://schema.org/size"],
    hasVariant: product.variants.map((v) => ({
      "@type": "Product",
      name: `${product.name}, ${v.name}`,
      color: v.name,
      sku: `${product.slug}-${v.id}`,
      offers: {
        "@type": "Offer",
        url: `/products/${product.slug}?color=${v.id}`,
        priceCurrency: product.currency,
        price: variantPrice(product, v),
        availability: inStock(v) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    })),
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = getProduct(slug);
  if (!product) notFound();

  const color = first(query.color);
  const model = first(query.model);
  const variantIndex = Math.max(0, product.variants.findIndex((v) => v.id === color));
  const gender: ModelGender =
    modelGenders.includes(model as ModelGender) && product.genders.includes(model as ModelGender)
      ? (model as ModelGender)
      : product.genders[0]!;

  const pairings = (product.completeTheLook?.slugs ?? [])
    .map((s) => getProduct(s))
    .filter((p): p is Product => Boolean(p));
  const more = products.filter((p) => p.slug !== product.slug);

  return (
    <>
      <script
        type="application/ld+json"
        // Product data is our own static content; escape "<" so it can't close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(product)).replace(/</g, "\\u003c") }}
      />
      <ProductView
        key={product.slug}
        product={product}
        pairings={pairings}
        initialVariant={variantIndex}
        initialGender={gender}
      />

      <section aria-labelledby="more-heading" className="mx-auto mt-24 max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <h2 id="more-heading" className="display-type text-3xl sm:text-4xl">
          You may also like
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
          {more.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
