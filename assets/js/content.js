/* ------------------------------------------------------------------
   content.js — editorial content (recipes, FAQ)
   Kept separate from the catalogue so the admin backend can own
   products without touching the written pages.
------------------------------------------------------------------- */

window.ZN_RECIPES = [
  {
    id: 'gf-banana-muffins',
    image: 'assets/img/recipe-muffins.svg',
    steps: [
      'Heat the oven to 180°C. Mash three very ripe bananas — the blacker the better.',
      'Stir in 200 g almond flour, 60 g gluten-free oat flakes, two eggs, a tablespoon of molasses and a teaspoon of baking powder.',
      'Spoon into twelve cases, filling each about three-quarters.',
      'Bake 22–25 minutes, until a skewer comes out with a crumb or two on it. Cool in the tin, or they break.',
    ],
    title: 'Gluten-free banana muffins that don’t crumble',
    date: '12 August 2026',
    minutes: 35,
    excerpt: 'Almond flour keeps these soft for three days instead of three hours. Ripe bananas do the sweetening.',
    uses: ['dragon-almond-flour-200g', 'bettr-oat-flakes-gf-300g', 'dragon-molasses-400g']
  },
  {
    id: 'green-morning-smoothie',
    image: 'assets/img/recipe-smoothie.svg',
    steps: [
      'Blend one frozen banana with 200 ml coconut water until smooth.',
      'Add half a teaspoon of moringa powder — no more on the first attempt.',
      'Squeeze in half a lemon. This is the step people skip and it is the one that makes it drinkable.',
      'Top with a spoon of peeled hemp seeds.',
    ],
    title: 'The green smoothie people actually finish',
    date: '4 August 2026',
    minutes: 5,
    excerpt: 'Moringa is strong on its own. Half a teaspoon, plenty of banana, and a squeeze of lemon fixes it.',
    uses: ['dragon-moringa-powder-200g', 'dragon-coconut-water-350ml', 'dragon-hemp-seeds-200g']
  },
  {
    id: 'carob-date-toast',
    image: 'assets/img/recipe-toast.svg',
    steps: [
      'Toast two slices of gluten-free bread until the edges colour.',
      'Spread the carob and date paste while the bread is still warm so it loosens.',
      'Finish with flaky salt, or a little tahini if you want it less sweet.',
    ],
    title: 'Carob and date toast, the Cypriot answer to Nutella',
    date: '27 July 2026',
    minutes: 5,
    excerpt: 'Carob has grown here for centuries. Spread on warm gluten-free bread it needs nothing else.',
    uses: ['biovlastos-date-carob-220g', 'balviten-royal-bread-250g']
  },
  {
    id: 'no-sugar-baking',
    image: 'assets/img/recipe-baking.svg',
    steps: [
      'Xylitol: swap 1:1 for sugar by weight. It browns less, so give cakes an extra three or four minutes.',
      'Fructose: use about two thirds the weight of sugar. It browns faster — drop the oven 10°C.',
      'Stevia liquid: five to seven drops replace a teaspoon of sugar, but it adds no bulk. In cakes, replace the missing weight with ground almonds or apple purée.',
      'None of the three feed yeast, so bread still needs a little real sugar or honey to rise.',
    ],
    title: 'Baking without sugar: what actually works',
    date: '19 July 2026',
    minutes: 8,
    excerpt: 'Xylitol, fructose and stevia behave very differently in an oven. Here is the swap chart we give customers.',
    uses: ['dragon-xylitol-250g', 'santiveri-fructose-750g', 'santiveri-stevia-liquid-90ml']
  },
  {
    id: 'tahini-dressing',
    image: 'assets/img/recipe-tahini.svg',
    steps: [
      'Put three tablespoons of tahini in a bowl with the juice of one lemon. It will seize and go stiff. This is normal.',
      'Add cold water a tablespoon at a time, whisking, until it loosens into a pourable cream.',
      'Season with salt and a crushed garlic clove. Keeps a week in the fridge.',
    ],
    title: 'A tahini dressing for everything',
    date: '9 July 2026',
    minutes: 5,
    excerpt: 'Three tablespoons of tahini, one lemon, cold water added slowly until it loosens. Keeps a week.',
    uses: ['bettr-tahini-500g', 'dragon-hemp-seeds-200g']
  },
  {
    id: 'overnight-oats',
    image: 'assets/img/recipe-oats.svg',
    steps: [
      'Mix 50 g certified gluten-free oat flakes with 120 ml of milk or a plant drink.',
      'Add a tablespoon of maple syrup and two chopped dried plums.',
      'Cover and leave in the fridge overnight.',
      'In the morning loosen with a splash more milk and top with whatever fruit is in the house.',
    ],
    title: 'Overnight oats for a coeliac household',
    date: '1 July 2026',
    minutes: 10,
    excerpt: 'Certified gluten-free oats matter here — ordinary oats are milled alongside wheat.',
    uses: ['bettr-oat-flakes-gf-300g', 'verival-maple-syrup-250ml', 'biovlastos-damaskina-200g']
  }
];

window.ZN_FAQ = [
  {
    q: 'Where do you deliver?',
    a: 'Anywhere in the Republic of Cyprus. Orders placed before 14:00 on a working day usually arrive the next working day in Nicosia, Limassol, Larnaca and Paphos, and within two days for villages and Paralimni.'
  },
  {
    q: 'How much is delivery?',
    a: 'A flat 3,50 € per order, and free once your basket passes 50 €. You can also collect from the office in Latsia at no charge.'
  },
  {
    q: 'Are your gluten-free products safe for coeliacs?',
    a: 'Everything listed as gluten free is certified below 20 ppm by the producer. Balviten and Santiveri run dedicated gluten-free lines. If you need the certificate for a specific batch, email us and we will send it.'
  },
  {
    q: 'Do you supply shops and pharmacies?',
    a: 'Yes. Wholesale has been the main part of the business since 2009 and we hold the Cyprus distribution for several of the brands on this site. Email eshop@zeronine.com.cy for a trade price list.'
  },
  {
    q: 'What does “no added sugar” mean on your labels?',
    a: 'No sucrose, glucose syrup or fructose syrup has been added. Some products still contain the sugars naturally present in fruit, which is why the nutrition panel may show a value above zero.'
  },
  {
    q: 'Can I return something?',
    a: 'Unopened items can be returned within 14 days. Chilled and short-dated stock from the Expires Soon section is sold as final. Contact us first so we can arrange the collection.'
  }
];
