import { products } from "@/data/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 md:pt-16 lg:px-10">
      <h1 className="display-type max-w-[14ch] text-5xl sm:text-6xl lg:text-[5.5rem] lg:leading-[0.92]">
        Heavy cotton, cut wide.
      </h1>
      <p className="mt-5 max-w-[48ch] text-ink-soft">
        Three pieces, each in five or six colours. Open one to see every colour on a model.
      </p>
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
