import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ShopBrowser } from '@/components/shop-browser';
import { getAllProducts, getBrands, getCategories } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'The full Zero Nine catalogue — organic, gluten-free, sugar-free, natural and vegan food, filtered by department, brand and diet.',
};

export default async function ShopPage() {
  const [products, categories, brands] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="shell py-10 lg:py-14">
      {/*
        `useSearchParams` inside ShopBrowser needs a Suspense boundary: during
        the static build there is no query string, so the page prerenders as the
        unfiltered shop and the filters apply on hydration.
      */}
      <Suspense
        fallback={
          <div className="py-20 text-center font-mono text-2xs uppercase tracking-eyebrow text-ink-muted">
            Loading the catalogue…
          </div>
        }
      >
        <ShopBrowser products={products} categories={categories} brands={brands} />
      </Suspense>
    </div>
  );
}
