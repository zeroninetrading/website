/**
 * The catalogue, as data.
 *
 * The demo build is a static export for GitHub Pages, so there is no Node
 * process and no database at runtime. Everything the storefront renders lives
 * in this file and is bundled at build time.
 *
 * This is deliberately shaped like the rows the database will hold, so the
 * backend milestone can generate the Prisma seed straight from this file and
 * swap `src/lib/products.ts` back to real queries without touching any page.
 */

export type Spec = { label: string; value: string };

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  comparePriceCents: number | null;
  shortDescription: string | null;
  description: string | null;
  specs: Spec[];
  images: string[];
  sku: string | null;
  stock: number;
  inStock: boolean;
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  categoryName: string | null;
  categorySlug: string | null;
  brandName: string | null;
  brandSlug: string | null;
};

export type CategoryView = {
  id: string;
  name: string;
  slug: string;
  blurb: string | null;
  productCount: number;
};

export type BrandView = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type RecipeView = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  publishedAt: Date;
};

// --------------------------------------------------------------- departments

const CATEGORY_SOURCE = [
  { name: 'Organic', slug: 'organic', blurb: 'Certified bio, no pesticides, no shortcuts.' },
  { name: 'Gluten Free', slug: 'gluten-free', blurb: 'Breads, biscuits and mueslis you can trust.' },
  { name: 'No Sugar', slug: 'no-sugar', blurb: 'Stevia, fructose and diabetic-friendly staples.' },
  { name: 'Supplements', slug: 'supplements', blurb: 'Superfood powders and daily support.' },
  { name: 'Natural Products', slug: 'natural-products', blurb: 'Simple ingredients, nothing added.' },
  { name: 'Vegan', slug: 'vegan', blurb: 'Plant-based across the whole shelf.' },
];

const BRAND_SOURCE = [
  'Dragon',
  'Santiveri',
  'Verival',
  'Balviten',
  'Bettr',
  'Byodo',
  'Biagi',
  'Roo Bar',
];

// ------------------------------------------------------------------ products

type ProductSource = Omit<
  ProductView,
  'id' | 'inStock' | 'categoryName' | 'brandName' | 'images' | 'comparePriceCents'
> & {
  category: string;
  brand: string;
  comparePriceCents?: number;
  images?: string[];
};

const PRODUCT_SOURCE: ProductSource[] = [
  {
    name: 'Dragon Bio Psyllium Husk 200g',
    slug: 'dragon-bio-psyllium-husk-200g',
    priceCents: 790,
    brand: 'dragon',
    category: 'supplements',
    categorySlug: 'supplements',
    brandSlug: 'dragon',
    shortDescription: 'Pure milled psyllium husk — a gentle daily source of soluble fibre.',
    description:
      'Milled from the husk of Plantago ovata seeds and nothing else. Stir a teaspoon into water, juice or a smoothie, or fold it into gluten-free baking to hold moisture. Certified organic, unsweetened and unflavoured.',
    specs: [
      { label: 'Weight', value: '200g' },
      { label: 'Certification', value: 'EU Organic' },
      { label: 'Ingredients', value: 'Psyllium husk 99%' },
      { label: 'Storage', value: 'Cool, dry place' },
    ],
    sku: 'DRG-PSY-200',
    stock: 42,
    isFeatured: true,
    ratingAvg: 5,
    ratingCount: 5,
    tags: ['vegan', 'gluten-free'],
  },
  {
    name: 'Santiveri Fructose In Bag 750g',
    slug: 'santiveri-fructose-in-bag-750g',
    priceCents: 530,
    brand: 'santiveri',
    category: 'no-sugar',
    categorySlug: 'no-sugar',
    brandSlug: 'santiveri',
    shortDescription: 'Fruit sugar that sweetens harder, so you use less of it.',
    description:
      'Crystalline fructose with a low glycaemic index, roughly 1.3 times sweeter than table sugar. Dissolves cleanly in cold drinks and behaves predictably in baking. A long-standing favourite with our diabetic customers.',
    specs: [
      { label: 'Weight', value: '750g' },
      { label: 'Ingredients', value: 'Fructose 100%' },
      { label: 'Suitable for', value: 'Diabetic diets' },
    ],
    sku: 'SAN-FRU-750',
    stock: 60,
    isFeatured: true,
    ratingAvg: 5,
    ratingCount: 5,
    tags: ['vegan'],
  },
  {
    name: 'Santiveri G/F Stevia Liquid 90ml',
    slug: 'santiveri-gf-stevia-liquid-90ml',
    priceCents: 590,
    brand: 'santiveri',
    category: 'no-sugar',
    categorySlug: 'no-sugar',
    brandSlug: 'santiveri',
    shortDescription: 'Zero-calorie liquid stevia with a dropper — three drops per cup.',
    description:
      'Steviol glycosides in a clear solution, with none of the grassy aftertaste of cheaper extracts. Sweetens coffee, tea, yoghurt and cold drinks without a single calorie. Gluten free.',
    specs: [
      { label: 'Volume', value: '90ml' },
      { label: 'Calories', value: '0 kcal' },
      { label: 'Dosage', value: '~3 drops = 1 tsp sugar' },
    ],
    sku: 'SAN-STV-090',
    stock: 35,
    isFeatured: true,
    ratingAvg: 5,
    ratingCount: 8,
    tags: ['vegan', 'gluten-free'],
  },
  {
    name: 'Dragon Bio Moringa Powder 200g',
    slug: 'dragon-bio-moringa-powder-200g',
    priceCents: 1350,
    brand: 'dragon',
    category: 'supplements',
    categorySlug: 'supplements',
    brandSlug: 'dragon',
    shortDescription: 'Leaf-green moringa, shade-dried and stone-milled.',
    description:
      'Moringa oleifera leaves dried below 40°C to protect the chlorophyll, then milled fine enough to disappear into a smoothie. Earthy, slightly peppery. Start with half a teaspoon a day.',
    specs: [
      { label: 'Weight', value: '200g' },
      { label: 'Certification', value: 'EU Organic' },
      { label: 'Origin', value: 'India' },
      { label: 'Serving', value: '½–1 tsp daily' },
    ],
    sku: 'DRG-MOR-200',
    stock: 18,
    isFeatured: true,
    ratingAvg: 5,
    ratingCount: 3,
    tags: ['vegan', 'raw'],
  },
  {
    name: 'Dragon Bio Matcha 100g',
    slug: 'dragon-bio-matcha-100g',
    priceCents: 1350,
    brand: 'dragon',
    category: 'organic',
    categorySlug: 'organic',
    brandSlug: 'dragon',
    shortDescription: 'Shade-grown Japanese green tea, milled to a fine ceremonial powder.',
    description:
      'Whisk with water just off the boil for a bright, vegetal cup, or blend into oat milk for a matcha latte. Naturally high in L-theanine, so the lift is steady rather than sharp.',
    specs: [
      { label: 'Weight', value: '100g' },
      { label: 'Certification', value: 'EU Organic' },
      { label: 'Origin', value: 'Japan' },
      { label: 'Preparation', value: '1 tsp per 80ml water at 80°C' },
    ],
    sku: 'DRG-MAT-100',
    stock: 22,
    isFeatured: true,
    ratingAvg: 5,
    ratingCount: 2,
    tags: ['vegan'],
  },
  {
    name: 'Dragon Bio Coconut Water 350ml',
    slug: 'dragon-bio-coconut-water-350ml',
    priceCents: 565,
    brand: 'dragon',
    category: 'natural-products',
    categorySlug: 'natural-products',
    brandSlug: 'dragon',
    shortDescription: 'Straight from young green coconuts. Nothing concentrated, nothing added.',
    description:
      'Tapped from young coconuts and bottled without sugar, preservatives or concentrate. Naturally high in potassium, which is why it works better than water after a long walk in a Cyprus August.',
    specs: [
      { label: 'Volume', value: '350ml' },
      { label: 'Certification', value: 'EU Organic' },
      { label: 'Added sugar', value: 'None' },
    ],
    sku: 'DRG-CCW-350',
    stock: 48,
    isFeatured: true,
    ratingAvg: 0,
    ratingCount: 0,
    tags: ['vegan'],
  },
  {
    name: 'Bettr Bio Apple Chips 50g',
    slug: 'bettr-bio-apple-chips-50g',
    priceCents: 295,
    brand: 'bettr',
    category: 'organic',
    categorySlug: 'organic',
    brandSlug: 'bettr',
    shortDescription: 'Whole apples, sliced and dried. One ingredient, no oil.',
    description:
      'Organic apples sliced thin and air-dried until they snap. No oil, no sugar, no sulphites — the sweetness is entirely the fruit. The lunchbox snack parents actually approve of.',
    specs: [
      { label: 'Weight', value: '50g' },
      { label: 'Ingredients', value: 'Organic apples 100%' },
      { label: 'Certification', value: 'EU Organic' },
    ],
    sku: 'BTR-APL-050',
    stock: 75,
    isFeatured: true,
    ratingAvg: 4.17,
    ratingCount: 6,
    tags: ['vegan', 'gluten-free', 'kids'],
  },
  {
    name: 'Santiveri Gluten Free Jungla Biscuits 100g',
    slug: 'santiveri-gluten-free-jungla-biscuits-100g',
    priceCents: 195,
    brand: 'santiveri',
    category: 'gluten-free',
    categorySlug: 'gluten-free',
    brandSlug: 'santiveri',
    shortDescription: 'Animal-shaped biscuits that gluten-free kids can share at parties.',
    description:
      'Crisp, lightly sweet biscuits made on a dedicated gluten-free line. Small enough for little hands and sturdy enough to survive a school bag.',
    specs: [
      { label: 'Weight', value: '100g' },
      { label: 'Gluten', value: 'Certified gluten free' },
      { label: 'Suitable for', value: 'Coeliac diets' },
    ],
    sku: 'SAN-JUN-100',
    stock: 90,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 2,
    tags: ['gluten-free', 'kids'],
  },
  {
    name: 'Dragon Bio Coconut Oil, Extra Virgin 1000ml',
    slug: 'dragon-bio-coconut-oil-extra-virgin-1000ml',
    priceCents: 1800,
    comparePriceCents: 2100,
    brand: 'dragon',
    category: 'organic',
    categorySlug: 'organic',
    brandSlug: 'dragon',
    shortDescription: 'Cold-pressed, unrefined, and big enough to cook and moisturise with.',
    description:
      'Pressed from fresh coconut flesh without heat or solvents, so it keeps its aroma. Solid below 24°C and liquid above — both are normal. Good for frying, baking, and skin.',
    specs: [
      { label: 'Volume', value: '1000ml' },
      { label: 'Process', value: 'Cold-pressed, unrefined' },
      { label: 'Certification', value: 'EU Organic' },
      { label: 'Smoke point', value: '~177°C' },
    ],
    sku: 'DRG-COIL-1000',
    stock: 14,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 5,
    tags: ['vegan', 'offers'],
  },
  {
    name: 'Dragon Bio Hemp Seeds, Peeled 200g',
    slug: 'dragon-bio-hemp-seeds-peeled-200g',
    priceCents: 750,
    brand: 'dragon',
    category: 'supplements',
    categorySlug: 'supplements',
    brandSlug: 'dragon',
    shortDescription: 'Soft, nutty hemp hearts — a complete plant protein.',
    description:
      'Hulled hemp seeds with a texture close to pine nuts. Contains all nine essential amino acids plus a good omega-3 to omega-6 ratio. Scatter over salads, porridge or hummus.',
    specs: [
      { label: 'Weight', value: '200g' },
      { label: 'Protein', value: '31g per 100g' },
      { label: 'Certification', value: 'EU Organic' },
    ],
    sku: 'DRG-HMP-200',
    stock: 30,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 5,
    tags: ['vegan', 'raw', 'gluten-free'],
  },
  {
    name: 'Dragon Bio In Shape Mix 200g',
    slug: 'dragon-bio-in-shape-mix-200g',
    priceCents: 1100,
    brand: 'dragon',
    category: 'supplements',
    categorySlug: 'supplements',
    brandSlug: 'dragon',
    shortDescription: 'A pre-blended superfood mix for people who will not measure four powders.',
    description:
      'Wheatgrass, spirulina, chlorella and moringa already balanced, so a single spoon does the work of a shelf. Blend into juice rather than water — it is a green mix and it tastes like one.',
    specs: [
      { label: 'Weight', value: '200g' },
      { label: 'Blend', value: 'Wheatgrass, spirulina, chlorella, moringa' },
      { label: 'Certification', value: 'EU Organic' },
    ],
    sku: 'DRG-INS-200',
    stock: 16,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 2,
    tags: ['vegan'],
  },
  {
    name: 'Balviten Gluten-Free Bread "Double Bus" 500g',
    slug: 'balviten-gluten-free-bread-double-bus-500g',
    priceCents: 440,
    brand: 'balviten',
    category: 'gluten-free',
    categorySlug: 'gluten-free',
    brandSlug: 'balviten',
    shortDescription: 'A full-size gluten-free loaf that holds together in a sandwich.',
    description:
      'Baked on a dedicated gluten-free line and packed for a long shelf life. Slice and toast straight from the pack; freeze what you will not use in a week.',
    specs: [
      { label: 'Weight', value: '500g' },
      { label: 'Gluten', value: 'Certified gluten free' },
      { label: 'Storage', value: 'Ambient until opened' },
    ],
    sku: 'BAL-DBS-500',
    stock: 55,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 10,
    tags: ['gluten-free'],
  },
  {
    name: 'Dragon Bio Molasses from Cane Sugar 400g',
    slug: 'dragon-bio-molasses-from-cane-sugar-400g',
    priceCents: 445,
    brand: 'dragon',
    category: 'natural-products',
    categorySlug: 'natural-products',
    brandSlug: 'dragon',
    shortDescription: 'Dark, mineral-rich cane molasses with a liquorice edge.',
    description:
      'The syrup left after cane sugar crystallises, so it keeps the iron, calcium and magnesium the refining process strips out. Strong flavour — use it in gingerbread, marinades and dark breads.',
    specs: [
      { label: 'Weight', value: '400g' },
      { label: 'Certification', value: 'EU Organic' },
      { label: 'Ingredients', value: 'Sugar cane molasses 100%' },
    ],
    sku: 'DRG-MOL-400',
    stock: 26,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 2,
    tags: ['vegan'],
  },
  {
    name: 'Dragon Bio Almond Flour 200g',
    slug: 'dragon-bio-almond-flour-200g',
    priceCents: 880,
    brand: 'dragon',
    category: 'gluten-free',
    categorySlug: 'gluten-free',
    brandSlug: 'dragon',
    shortDescription: 'Finely milled blanched almonds for low-carb and gluten-free baking.',
    description:
      'Ground from blanched organic almonds, fine enough for macarons and rich enough to replace up to a third of the flour in a cake. Keeps best in the fridge once opened.',
    specs: [
      { label: 'Weight', value: '200g' },
      { label: 'Certification', value: 'EU Organic' },
      { label: 'Storage', value: 'Refrigerate after opening' },
    ],
    sku: 'DRG-ALM-200',
    stock: 33,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 7,
    tags: ['vegan', 'gluten-free'],
  },
  {
    name: 'Verival Bio Maple Syrup Grade A 250ml',
    slug: 'verival-bio-maple-syrup-grade-a-250ml',
    priceCents: 935,
    brand: 'verival',
    category: 'organic',
    categorySlug: 'organic',
    brandSlug: 'verival',
    shortDescription: 'Single-origin Canadian maple, amber and clean-tasting.',
    description:
      'Grade A amber syrup boiled down from the sap of organic maple stands. Pours thinner than honey, which makes it the better choice on pancakes and porridge.',
    specs: [
      { label: 'Volume', value: '250ml' },
      { label: 'Grade', value: 'A — Amber, rich taste' },
      { label: 'Origin', value: 'Canada' },
    ],
    sku: 'VER-MPL-250',
    stock: 20,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 2,
    tags: ['vegan'],
  },
  {
    name: 'Verival Bio Muesli Coconut & Apricots G/Free 325g',
    slug: 'verival-bio-muesli-coconut-apricots-gluten-free-325g',
    priceCents: 550,
    brand: 'verival',
    category: 'gluten-free',
    categorySlug: 'gluten-free',
    brandSlug: 'verival',
    shortDescription: 'Gluten-free oat muesli with coconut chips and soft apricot.',
    description:
      'Built on certified gluten-free oats, with coconut chips for crunch and unsulphured apricots for sweetness. No refined sugar in the mix.',
    specs: [
      { label: 'Weight', value: '325g' },
      { label: 'Gluten', value: 'Certified gluten free' },
      { label: 'Added sugar', value: 'None' },
    ],
    sku: 'VER-MUE-325',
    stock: 0,
    isFeatured: false,
    ratingAvg: 5,
    ratingCount: 8,
    tags: ['gluten-free', 'vegan'],
  },
];

// ------------------------------------------------------------------- recipes

const RECIPE_SOURCE = [
  {
    title: "Muffin Recipes You Can't Resist",
    slug: 'muffin-recipes-you-cant-resist',
    excerpt:
      'Almond flour, a spoon of molasses and ripe bananas — a muffin that holds together without gluten and without refined sugar.',
    publishedAt: '2026-06-18',
  },
  {
    title: 'Top Fruit Smoothie Ingredients',
    slug: 'top-fruit-smoothie-ingredients',
    excerpt:
      'What actually belongs in the blender: a base, a fat, a green and a fruit. Here is how we build ours with moringa and hemp hearts.',
    publishedAt: '2026-05-02',
  },
  {
    title: 'A Salad with Mozzarella Cheese',
    slug: 'best-salads-with-mozzarella-cheese',
    excerpt:
      'Southwest quinoa salad with mozzarella, hemp seeds and a lemon dressing. Twenty minutes, one bowl.',
    publishedAt: '2026-04-11',
  },
];

// ------------------------------------------------------------------- derived

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const BRANDS: BrandView[] = BRAND_SOURCE.map((name) => ({
  id: slugify(name),
  name,
  slug: slugify(name),
  logoUrl: null,
}));

const BRAND_NAMES = new Map(BRANDS.map((brand) => [brand.slug, brand.name]));
const CATEGORY_NAMES = new Map(
  CATEGORY_SOURCE.map((category) => [category.slug, category.name])
);

export const PRODUCTS: ProductView[] = PRODUCT_SOURCE.map((source) => ({
  id: source.slug,
  name: source.name,
  slug: source.slug,
  priceCents: source.priceCents,
  comparePriceCents: source.comparePriceCents ?? null,
  shortDescription: source.shortDescription,
  description: source.description,
  specs: source.specs,
  images: source.images ?? [],
  sku: source.sku,
  stock: source.stock,
  inStock: source.stock > 0,
  isFeatured: source.isFeatured,
  ratingAvg: source.ratingAvg,
  ratingCount: source.ratingCount,
  tags: source.tags,
  categorySlug: source.category,
  categoryName: CATEGORY_NAMES.get(source.category) ?? null,
  brandSlug: source.brand,
  brandName: BRAND_NAMES.get(source.brand) ?? null,
}));

export const CATEGORIES: CategoryView[] = CATEGORY_SOURCE.map((category) => ({
  id: category.slug,
  name: category.name,
  slug: category.slug,
  blurb: category.blurb,
  // "Vegan" and the other diet shelves cut across departments, so the count is
  // whatever actually carries that slug as a category or a tag.
  productCount: PRODUCTS.filter(
    (product) => product.categorySlug === category.slug || product.tags.includes(category.slug)
  ).length,
}));

export const RECIPES: RecipeView[] = RECIPE_SOURCE.map((recipe) => ({
  id: recipe.slug,
  title: recipe.title,
  slug: recipe.slug,
  excerpt: recipe.excerpt,
  body: null,
  imageUrl: null,
  publishedAt: new Date(recipe.publishedAt),
}));

// ------------------------------------------------------------------ querying

export type ProductQuery = {
  categorySlug?: string;
  brandSlug?: string;
  tag?: string;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name';
  take?: number;
};

/**
 * Pure filter, shared by the statically rendered pages and the client-side
 * shop. Keeping it pure is what lets the shop page filter in the browser
 * without a server round trip.
 */
export function filterProducts(
  products: ProductView[],
  query: ProductQuery = {}
): ProductView[] {
  const { categorySlug, brandSlug, tag, search, sort = 'newest', take } = query;
  const term = search?.trim().toLowerCase();

  let result = products.filter((product) => {
    if (categorySlug) {
      const matches =
        product.categorySlug === categorySlug || product.tags.includes(categorySlug);
      if (!matches) return false;
    }
    if (brandSlug && product.brandSlug !== brandSlug) return false;
    if (tag && !product.tags.includes(tag)) return false;
    if (term) {
      const haystack = [product.name, product.shortDescription, product.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.priceCents - b.priceCents;
      case 'price-desc':
        return b.priceCents - a.priceCents;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        // "Newest" has no timestamps in a static catalogue, so it holds the
        // hand-ordered sequence above — which is the order the client would
        // see in the admin panel.
        return 0;
    }
  });

  return take ? result.slice(0, take) : result;
}
