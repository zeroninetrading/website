'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ProductCard } from './product-card';
import { ShopFilters } from './shop-filters';
import { filterProducts, type BrandView, type CategoryView, type ProductView } from '@/lib/catalogue';

const VALID_SORTS = new Set(['newest', 'price-asc', 'price-desc', 'name']);

/**
 * On a static host there is no server to read `?category=` for us, so the whole
 * catalogue ships with the page and the filtering happens here. The upside is
 * that every filter change is instant and the URL stays shareable.
 */
export function ShopBrowser({
  products,
  categories,
  brands,
}: {
  products: ProductView[];
  categories: CategoryView[];
  brands: BrandView[];
}) {
  const searchParams = useSearchParams();

  const category = searchParams.get('category') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  const search = searchParams.get('q') ?? undefined;
  const sortParam = searchParams.get('sort') ?? 'newest';
  const sort = VALID_SORTS.has(sortParam)
    ? (sortParam as 'newest' | 'price-asc' | 'price-desc' | 'name')
    : 'newest';

  const results = useMemo(
    () =>
      filterProducts(products, {
        categorySlug: category,
        brandSlug: brand,
        tag,
        search,
        sort,
      }),
    [products, category, brand, tag, search, sort]
  );

  const heading =
    categories.find((item) => item.slug === category)?.name ??
    brands.find((item) => item.slug === brand)?.name ??
    (search ? `Results for “${search}”` : 'The whole shop');

  return (
    <>
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-2 font-display text-4xl">{heading}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <ShopFilters categories={categories} brands={brands} resultCount={results.length} />
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="rounded-card border border-dashed border-stone-deep px-6 py-16 text-center">
              <h2 className="font-display text-2xl">Nothing matches those filters</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                Try a wider department, or clear the brand filter — we stock eight brands and
                not all of them cover every diet.
              </p>
              <Link href="/shop" className="btn btn-primary mt-6">
                Reset the filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {results.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
