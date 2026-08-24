import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCart } from '@/components/add-to-cart';
import { ProductCard } from '@/components/product-card';
import { ProductImage } from '@/components/product-image';
import { Stars } from '@/components/stars';
import { discountPercent, formatPrice } from '@/lib/format';
import { getAllProducts, getProductBySlug, getRelatedProducts } from '@/lib/products';

type Params = { params: { slug: string } };

/** Every product page is prerendered to HTML at build time for the static host. */
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product not found' };

  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images.length > 0 ? product.images : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const discount = discountPercent(product.priceCents, product.comparePriceCents);

  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-2 font-mono text-2xs uppercase tracking-eyebrow text-ink-muted">
          <li>
            <Link href="/" className="hover:text-leaf-deep">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop" className="hover:text-leaf-deep">
              Shop
            </Link>
          </li>
          {product.categorySlug && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/shop?category=${product.categorySlug}`}
                  className="hover:text-leaf-deep"
                >
                  {product.categoryName}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <ProductImage
            name={product.name}
            src={product.images[0]}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-square w-full rounded-card border border-stone"
          />

          {product.images.length > 1 && (
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((image, index) => (
                <li key={image}>
                  <ProductImage
                    name={`${product.name} — view ${index + 1}`}
                    src={image}
                    sizes="120px"
                    className="aspect-square w-full rounded-lg border border-stone"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {product.brandName && (
            <Link href={`/shop?brand=${product.brandSlug}`} className="eyebrow hover:text-leaf-deep">
              {product.brandName}
            </Link>
          )}

          <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="mt-4">
              <Stars value={product.ratingAvg} count={product.ratingCount} />
            </div>
          )}

          {product.shortDescription && (
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span
              className={`shelf-tag shelf-tag--lg ${discount !== null ? 'shelf-tag--offer' : ''}`}
            >
              {formatPrice(product.priceCents)}
            </span>
            {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
              <span className="font-mono text-sm text-ink-muted line-through">
                {formatPrice(product.comparePriceCents)}
              </span>
            )}
            {discount !== null && (
              <span className="font-mono text-2xs uppercase tracking-eyebrow text-honey-deep">
                Save {discount}%
              </span>
            )}
          </div>

          <p className="mt-3 font-mono text-2xs uppercase tracking-eyebrow text-ink-muted">
            {product.inStock
              ? product.stock <= 10
                ? `Only ${product.stock} left in the warehouse`
                : 'In stock, ships today'
              : 'Sold out — back within two weeks'}
          </p>

          <div className="mt-7">
            <AddToCart product={product} withQuantity />
          </div>

          {product.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/shop?tag=${tag}`}
                    className="inline-block rounded-full border border-stone-deep px-3 py-1 text-xs capitalize text-ink-soft transition-colors hover:border-leaf hover:text-leaf-deep"
                  >
                    {tag.replace('-', ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {product.description && (
            <div className="mt-9 border-t border-stone pt-7">
              <h2 className="eyebrow">About this product</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{product.description}</p>
            </div>
          )}

          {product.specs.length > 0 && (
            <div className="mt-8 border-t border-stone pt-7">
              <h2 className="eyebrow">Details</h2>
              <dl className="mt-3 divide-y divide-stone">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 py-2.5 text-sm">
                    <dt className="text-ink-muted">{spec.label}</dt>
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
                {product.sku && (
                  <div className="flex justify-between gap-6 py-2.5 text-sm">
                    <dt className="text-ink-muted">Product code</dt>
                    <dd className="text-right font-mono text-xs">{product.sku}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-stone pt-12">
          <p className="eyebrow">Goes with it</p>
          <h2 className="mt-2 font-display text-2xl">More from this shelf</h2>
          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
