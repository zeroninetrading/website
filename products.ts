/**
 * Storefront data access.
 *
 * These functions stay `async` even though the demo reads from a bundled
 * array. That is deliberate: when the backend milestone points them at Prisma,
 * every page that awaits them keeps working unchanged.
 */

import {
  BRANDS,
  CATEGORIES,
  PRODUCTS,
  RECIPES,
  filterProducts,
} from './catalogue';

export type {
  BrandView,
  CategoryView,
  ProductQuery,
  ProductView,
  RecipeView,
  Spec,
} from './catalogue';

import type { BrandView, CategoryView, ProductQuery, ProductView, RecipeView } from './catalogue';

export async function getProducts(query: ProductQuery = {}): Promise<ProductView[]> {
  return filterProducts(PRODUCTS, query);
}

export async function getAllProducts(): Promise<ProductView[]> {
  return PRODUCTS;
}

export async function getFeaturedProducts(take = 8): Promise<ProductView[]> {
  return PRODUCTS.filter((product) => product.isFeatured)
    .sort((a, b) => b.ratingCount - a.ratingCount)
    .slice(0, take);
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  return PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(
  product: ProductView,
  take = 4
): Promise<ProductView[]> {
  return PRODUCTS.filter(
    (candidate) =>
      candidate.id !== product.id &&
      (candidate.categorySlug === product.categorySlug ||
        candidate.brandSlug === product.brandSlug)
  ).slice(0, take);
}

export async function getProductsByIds(ids: string[]): Promise<ProductView[]> {
  if (ids.length === 0) return [];
  return PRODUCTS.filter((product) => ids.includes(product.id));
}

export async function getCategories(): Promise<CategoryView[]> {
  return CATEGORIES;
}

export async function getBrands(): Promise<BrandView[]> {
  return BRANDS;
}

export async function getRecipes(take = 3): Promise<RecipeView[]> {
  return RECIPES.slice(0, take);
}

export async function getRecipeBySlug(slug: string): Promise<RecipeView | null> {
  return RECIPES.find((recipe) => recipe.slug === slug) ?? null;
}
