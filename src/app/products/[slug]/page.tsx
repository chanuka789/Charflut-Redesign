import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/catalog";
import type { Product } from "@/lib/schema";
import { inStock, variantPrice } from "@/lib/product-utils";
import { ProductView } from "@/components/product/ProductView";
import { ProductCard } from "@/components/product/ProductCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every product page is built once at deploy time and served as a static file,
// so the server does no rendering per visit. ?color= and ?model= are read in
// the browser (see ProductView).
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

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

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  // Two colours from each of the other products.
  const more = products
    .filter((p) => p.slug !== product.slug)
    .flatMap((p) => p.variants.slice(0, 2).map((v) => ({ product: p, variant: v })));

  return (
    <>
      <script
        type="application/ld+json"
        // Product data is our own static content; escape "<" so it can't close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(product)).replace(/</g, "\\u003c") }}
      />
      <ProductView key={product.slug} product={product} />

      <section aria-labelledby="more-heading" className="mx-auto mt-16 max-w-[1600px] px-4 pb-20 sm:px-6 lg:px-10">
        <h2 id="more-heading" className="text-2xl font-bold tracking-[-0.01em]">
          You may also like
        </h2>
        <ul className="mt-8 grid grid-cols-2 items-start gap-x-4 gap-y-10 sm:gap-x-4 md:grid-cols-4">
          {more.map(({ product: p, variant: v }) => (
            <li key={`${p.slug}-${v.id}`}>
              <ProductCard product={p} variant={v} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
