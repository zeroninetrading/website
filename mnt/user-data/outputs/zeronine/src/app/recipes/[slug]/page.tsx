import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipeBySlug, getRecipes } from '@/lib/products';

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  const recipes = await getRecipes(100);
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) return { title: 'Recipe not found' };
  return { title: recipe.title, description: recipe.excerpt ?? undefined };
}

export default async function RecipePage({ params }: Params) {
  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) notFound();

  return (
    <article className="shell max-w-3xl py-12 lg:py-20">
      <Link
        href="/recipes"
        className="font-mono text-2xs uppercase tracking-eyebrow text-ink-muted hover:text-leaf-deep"
      >
        ← All recipes
      </Link>

      <time
        dateTime={recipe.publishedAt.toISOString()}
        className="mt-8 block font-mono text-2xs uppercase tracking-eyebrow text-ink-muted"
      >
        {recipe.publishedAt.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </time>

      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{recipe.title}</h1>

      {recipe.excerpt && <p className="mt-5 text-lg text-ink-soft">{recipe.excerpt}</p>}

      {recipe.body && (
        <div className="prose-body mt-8 border-t border-stone pt-8">
          {recipe.body.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}
    </article>
  );
}
