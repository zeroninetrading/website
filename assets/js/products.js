/* ------------------------------------------------------------------
   Zero Nine Trading — catalogue data
   ------------------------------------------------------------------
   This file is the ONLY place product information lives.

   In the production build this exact shape is served by the admin
   backend (GET /api/products). Set ZN_CONFIG.apiUrl in store.js and
   the site will fetch from the API instead of reading this file —
   nothing else in the codebase needs to change.

   Product shape
   -------------
   id        string   stable identifier, used in product.html?id=
   name      string
   brand     string   must exist in ZN_BRANDS below
   category  string   must exist in ZN_CATEGORIES below
   price     number   euros
   oldPrice  number   optional — renders a strike-through + "Save x%"
   size      string   pack size, shown under the name
   diets     array    any of: organic | gluten-free | no-sugar | vegan
   stock     number   0 = sold out
   rating    number   0 = no reviews yet
   reviews   number
   pack      string   drives the illustrated packshot (see packshot.js)
                      jar | bottle | pouch | box | bread | bar | tube |
                      carton | tin | sachet
   blurb     string   one line, used on the card and product page
   image     string   optional — a real photo URL overrides the packshot
------------------------------------------------------------------- */

window.ZN_BRANDS = {
  'Dragon':      { color: '#2E7D5B', origin: 'Bulgaria',    line: 'Organic superfoods, raw powders and oils.' },
  'Bettr':       { color: '#D8552F', origin: 'Bulgaria',    line: 'Nut butters, wafers and everyday organic snacks.' },
  'Balviten':    { color: '#2F6DB5', origin: 'Poland',      line: 'Gluten-free breads and bakery, made for coeliacs.' },
  'Santiveri':   { color: '#B8342C', origin: 'Spain',       line: 'Sugar alternatives and gluten-free biscuits since 1885.' },
  'Verival':     { color: '#D99311', origin: 'Austria',     line: 'Organic muesli, porridge and breakfast staples.' },
  'Biovlastos':  { color: '#6B8E3E', origin: 'Greece',      line: 'Organic flours, pasta and dried fruit from Greek growers.' },
  'Byodo':       { color: '#1F6FB2', origin: 'Germany',     line: 'Organic sauces, vinegars and condiments.' },
  'Roo Bar':     { color: '#E4572E', origin: 'Bulgaria',    line: 'Raw fruit and nut energy bars.' },
  'Biagi':       { color: '#7B4E9E', origin: 'Italy',       line: 'Italian organic pantry goods.' },
  'Sudanta':     { color: '#12897E', origin: 'India',       line: 'Ayurvedic oral and personal care.' }
};

window.ZN_CATEGORIES = [
  { id: 'organic',     name: 'Organic',        blurb: 'Certified organic pantry staples' },
  { id: 'gluten-free', name: 'Gluten free',    blurb: 'Breads, bakery and cereals for coeliacs' },
  { id: 'no-sugar',    name: 'No sugar',       blurb: 'Sweeteners and treats for diabetics' },
  { id: 'supplements', name: 'Supplements',    blurb: 'Powders, seeds and functional foods' },
  { id: 'natural',     name: 'Natural care',   blurb: 'Household and personal care' },
  { id: 'vegan',       name: 'Vegan',          blurb: 'Plant-based across every aisle' }
];

/* Diet labels — these drive the filter pills and the badges on every card. */
window.ZN_DIETS = [
  { id: 'gluten-free', short: 'GF',  name: 'Gluten free' },
  { id: 'no-sugar',    short: 'NS',  name: 'No added sugar' },
  { id: 'vegan',       short: 'VG',  name: 'Vegan' },
  { id: 'organic',     short: 'BIO', name: 'Organic' }
];

window.ZN_PRODUCTS = [
  /* ---------------------------------------------------------- Dragon */
  { id: 'dragon-psyllium-husk-200g', name: 'Bio Psyllium Husk', brand: 'Dragon', category: 'supplements', price: 7.90, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 24, rating: 5, reviews: 5, pack: 'pouch', blurb: 'Pure milled husk. A teaspoon in water is all it takes.' },
  { id: 'dragon-moringa-powder-200g', name: 'Bio Moringa Powder', brand: 'Dragon', category: 'supplements', price: 13.50, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 12, rating: 5, reviews: 3, pack: 'pouch', blurb: 'Leaf powder with a grassy, peppery edge. Blends into anything green.' },
  { id: 'dragon-matcha-100g', name: 'Bio Matcha', brand: 'Dragon', category: 'supplements', price: 13.50, oldPrice: 15.90, size: '100 g', diets: ['organic','vegan','gluten-free'], stock: 9, rating: 5, reviews: 2, pack: 'tin', blurb: 'Ceremonial-style green tea powder, whisked or shaken.' },
  { id: 'dragon-in-shape-mix-200g', name: 'Bio In Shape Mix', brand: 'Dragon', category: 'supplements', price: 11.00, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 15, rating: 5, reviews: 2, pack: 'pouch', blurb: 'Cacao, maca and baobab blended for a morning smoothie.' },
  { id: 'dragon-coconut-water-350ml', name: 'Bio Coconut Water', brand: 'Dragon', category: 'organic', price: 5.65, size: '350 ml', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 30, rating: 0, reviews: 0, pack: 'bottle', blurb: 'Nothing added. Straight from young green coconuts.' },
  { id: 'dragon-coconut-oil-1l', name: 'Bio Coconut Oil, Extra Virgin', brand: 'Dragon', category: 'organic', price: 18.00, oldPrice: 21.50, size: '1000 ml', diets: ['organic','vegan','gluten-free'], stock: 8, rating: 5, reviews: 5, pack: 'jar', blurb: 'Cold-pressed and unrefined, so it still smells of coconut.' },
  { id: 'dragon-hemp-seeds-200g', name: 'Bio Hemp Seeds, peeled', brand: 'Dragon', category: 'organic', price: 7.50, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 21, rating: 5, reviews: 5, pack: 'pouch', blurb: 'Soft, nutty and ready to scatter over anything savoury.' },
  { id: 'dragon-almond-flour-200g', name: 'Bio Almond Flour', brand: 'Dragon', category: 'gluten-free', price: 8.80, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 18, rating: 5, reviews: 7, pack: 'pouch', blurb: 'Finely ground blanched almonds for low-carb baking.' },
  { id: 'dragon-molasses-400g', name: 'Bio Molasses from Cane Sugar', brand: 'Dragon', category: 'organic', price: 4.45, size: '400 g', diets: ['organic','vegan','gluten-free'], stock: 26, rating: 5, reviews: 2, pack: 'jar', blurb: 'Dark, mineral-rich and bittersweet. Good in bread and marinades.' },
  { id: 'dragon-xylitol-250g', name: 'Bio Xylitol Powder', brand: 'Dragon', category: 'no-sugar', price: 7.30, size: '250 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 22, rating: 0, reviews: 0, pack: 'pouch', blurb: 'Spoons and tastes like sugar, without the blood-sugar spike.' },

  /* ------------------------------------------------------------ Bettr */
  { id: 'bettr-almond-butter-250g', name: 'Bio Almond Butter', brand: 'Bettr', category: 'organic', price: 8.90, size: '250 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 14, rating: 5, reviews: 5, pack: 'jar', blurb: 'Roasted almonds, ground until they turn to cream. Nothing else.' },
  { id: 'bettr-white-almond-butter-250g', name: 'Bio White Almond Butter', brand: 'Bettr', category: 'organic', price: 9.50, size: '250 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 11, rating: 5, reviews: 5, pack: 'jar', blurb: 'Made from blanched almonds — paler, milder, very smooth.' },
  { id: 'bettr-cashew-butter-250g', name: 'Bio Cashew Butter', brand: 'Bettr', category: 'organic', price: 8.20, size: '250 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 13, rating: 5, reviews: 5, pack: 'jar', blurb: 'Mild and buttery. The one to start children on.' },
  { id: 'bettr-peanut-butter-250g', name: 'Bio Peanut Butter', brand: 'Bettr', category: 'organic', price: 4.70, size: '250 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 40, rating: 5, reviews: 5, pack: 'jar', blurb: '100% peanuts, no palm oil, no added salt.' },
  { id: 'bettr-crunchy-peanut-butter-250g', name: 'Bio Crunchy Peanut Butter', brand: 'Bettr', category: 'organic', price: 4.70, size: '250 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 38, rating: 5, reviews: 5, pack: 'jar', blurb: 'Same jar, with pieces left in for texture.' },
  { id: 'bettr-hazelnut-spread-250g', name: 'Bio Hazelnut Spread', brand: 'Bettr', category: 'organic', price: 7.30, oldPrice: 8.60, size: '250 g', diets: ['organic','vegan','gluten-free'], stock: 17, rating: 5, reviews: 5, pack: 'jar', blurb: 'Cocoa and hazelnut, sweetened with cane sugar rather than syrup.' },
  { id: 'bettr-pistachio-spread-200g', name: 'Bio Pistachio Spread', brand: 'Bettr', category: 'organic', price: 8.60, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 7, rating: 0, reviews: 0, pack: 'jar', blurb: 'The green one everybody asks for. Limited stock each month.' },
  { id: 'bettr-tahini-500g', name: 'Bio Whole Sesame Tahini', brand: 'Bettr', category: 'organic', price: 8.20, size: '500 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 19, rating: 0, reviews: 0, pack: 'jar', blurb: 'Unhulled sesame, stone-ground. Earthy and slightly bitter.' },
  { id: 'bettr-strawberry-spread-250g', name: 'Bio Strawberry No Sugar Spread', brand: 'Bettr', category: 'no-sugar', price: 7.90, size: '250 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 16, rating: 0, reviews: 0, pack: 'jar', blurb: 'Set with fruit pectin instead of sugar, so the fruit still tastes fresh.' },
  { id: 'bettr-apple-chips-50g', name: 'Bio Apple Chips', brand: 'Bettr', category: 'organic', price: 2.95, size: '50 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 45, rating: 4.2, reviews: 6, pack: 'sachet', blurb: 'Sliced thin and dried. One ingredient: apples.' },
  { id: 'bettr-coconut-chips-caramel-70g', name: 'Coconut Chips Caramel', brand: 'Bettr', category: 'organic', price: 2.15, oldPrice: 2.60, size: '70 g', diets: ['organic','vegan','gluten-free'], stock: 42, rating: 5, reviews: 5, pack: 'sachet', blurb: 'Toasted coconut flakes with a thin caramel coat.' },
  { id: 'bettr-hazelnut-wafer-30g', name: 'Bio Hazelnut Cacao Wafer', brand: 'Bettr', category: 'organic', price: 1.30, size: '30 g', diets: ['organic','vegan'], stock: 60, rating: 5, reviews: 2, pack: 'bar', blurb: 'A proper wafer bar for the school bag.' },
  { id: 'bettr-hazelnut-wafer-ns-30g', name: 'Bio Hazelnut Cacao Wafer, no sugar', brand: 'Bettr', category: 'no-sugar', price: 1.30, size: '30 g', diets: ['organic','vegan','no-sugar'], stock: 55, rating: 0, reviews: 0, pack: 'bar', blurb: 'The same wafer, sweetened with erythritol.' },
  { id: 'bettr-lemon-wafer-30g', name: 'Bio Lemon Cream Wafer', brand: 'Bettr', category: 'organic', price: 1.30, size: '30 g', diets: ['organic','vegan'], stock: 50, rating: 0, reviews: 0, pack: 'bar', blurb: 'Sharp lemon cream between five thin layers.' },
  { id: 'bettr-strawberry-wafer-ns-30g', name: 'Bio Strawberry Wafer, no sugar', brand: 'Bettr', category: 'no-sugar', price: 1.30, size: '30 g', diets: ['organic','vegan','no-sugar'], stock: 48, rating: 0, reviews: 0, pack: 'bar', blurb: 'Strawberry cream, no added sugar.' },
  { id: 'bettr-choco-almonds-40g', name: 'Bio Coated Chocolate Almonds', brand: 'Bettr', category: 'organic', price: 2.25, size: '40 g', diets: ['organic','vegan','gluten-free'], stock: 33, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Whole almonds in dark chocolate. Dangerously easy.' },
  { id: 'bettr-choco-hazelnut-40g', name: 'Bio Coated Chocolate Hazelnut', brand: 'Bettr', category: 'organic', price: 2.25, size: '40 g', diets: ['organic','vegan','gluten-free'], stock: 31, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Hazelnuts in dark chocolate, same idea.' },
  { id: 'bettr-choco-spaceships-70g', name: 'Bio Dark Choco Spaceships', brand: 'Bettr', category: 'organic', price: 3.95, size: '70 g', diets: ['organic','vegan'], stock: 20, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Puffed cereal shapes in dark chocolate. Aimed squarely at children.' },
  { id: 'bettr-pistachio-pralines-39g', name: 'Bio Pistachio Butter Filling', brand: 'Bettr', category: 'organic', price: 3.20, size: '39 g (3×13 g)', diets: ['organic','vegan','gluten-free'], stock: 24, rating: 0, reviews: 0, pack: 'box', blurb: 'Three pralines with a soft pistachio centre.' },
  { id: 'bettr-hazelnut-pralines-39g', name: 'Bio Pralines Hazelnut Butter Filling', brand: 'Bettr', category: 'organic', price: 3.20, size: '39 g (3×13 g)', diets: ['organic','vegan','gluten-free'], stock: 25, rating: 0, reviews: 0, pack: 'box', blurb: 'Three pralines, hazelnut centre.' },
  { id: 'bettr-matcha-latte-200g', name: 'Bio Matcha Latte Instant', brand: 'Bettr', category: 'supplements', price: 9.90, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 14, rating: 0, reviews: 0, pack: 'tin', blurb: 'Matcha with coconut milk powder. Just add hot water.' },
  { id: 'bettr-oat-flakes-gf-300g', name: 'Bio Oat Fine Flakes, gluten free', brand: 'Bettr', category: 'gluten-free', price: 3.15, size: '300 g', diets: ['organic','vegan','gluten-free'], stock: 36, rating: 0, reviews: 0, pack: 'box', blurb: 'Oats grown and milled away from wheat. Safe for coeliacs.' },
  { id: 'bettr-brownie-mix-gf-400g', name: 'Bio Protein Brownie Mix, gluten free', brand: 'Bettr', category: 'gluten-free', price: 8.95, size: '400 g', diets: ['organic','vegan','gluten-free'], stock: 12, rating: 0, reviews: 0, pack: 'box', blurb: 'Add water and oil. Comes out fudgy, not cakey.' },
  { id: 'bettr-soup-chickpeas-30g', name: 'Bio Protein Soup with Chickpeas', brand: 'Bettr', category: 'organic', price: 1.65, size: '30 g', diets: ['organic','vegan','gluten-free'], stock: 44, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Desk lunch. One sachet, 250 ml of boiling water.' },
  { id: 'bettr-soup-potato-30g', name: 'Bio Protein Soup with Potato', brand: 'Bettr', category: 'organic', price: 1.65, size: '30 g', diets: ['organic','vegan','gluten-free'], stock: 41, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Creamy potato, no dairy in it at all.' },
  { id: 'bettr-soup-lentils-30g', name: 'Bio Protein Soup with Red Lentils', brand: 'Bettr', category: 'organic', price: 1.65, size: '30 g', diets: ['organic','vegan','gluten-free'], stock: 39, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Warmly spiced red lentil, the most filling of the three.' },
  { id: 'bettr-smoothie-mango-250ml', name: 'Bio Smoothie Mango, Passion & Chia', brand: 'Bettr', category: 'organic', price: 3.20, size: '250 ml', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 28, rating: 0, reviews: 0, pack: 'bottle', blurb: 'Fruit and chia only — the sweetness is the mango.' },
  { id: 'bettr-smoothie-pineapple-250ml', name: 'Bio Smoothie Pineapple, Aloe & Mint', brand: 'Bettr', category: 'organic', price: 3.20, size: '250 ml', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 27, rating: 0, reviews: 0, pack: 'bottle', blurb: 'The sharpest of the three. Best cold.' },
  { id: 'bettr-smoothie-raspberry-250ml', name: 'Bio Smoothie Raspberry, Acai & Coco', brand: 'Bettr', category: 'organic', price: 3.20, size: '250 ml', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 29, rating: 0, reviews: 0, pack: 'bottle', blurb: 'Deep red, thick, and faintly coconutty.' },
  { id: 'bettr-rice-chips-quinoa-60g', name: 'Bio Rice Chips Quinoa & Chia', brand: 'Bettr', category: 'gluten-free', price: 1.90, size: '60 g', diets: ['organic','vegan','gluten-free'], stock: 0, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Light, salty and crisp. Back in stock most weeks.' },
  { id: 'bettr-coffee-ground-200g', name: 'Bio Ground Special Coffee Blend', brand: 'Bettr', category: 'organic', price: 13.40, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 0, rating: 0, reviews: 0, pack: 'pouch', blurb: 'Arabica blend, ground for filter and moka.' },
  { id: 'bettr-coffee-beans-200g', name: 'Bio Whole Bean Special Coffee Blend', brand: 'Bettr', category: 'organic', price: 13.40, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 0, rating: 0, reviews: 0, pack: 'pouch', blurb: 'The same blend, whole bean, for espresso.' },

  /* --------------------------------------------------------- Balviten */
  { id: 'balviten-double-bus-500g', name: 'Gluten-Free Bread “Double Bus”', brand: 'Balviten', category: 'gluten-free', price: 4.40, size: '500 g', diets: ['gluten-free','vegan'], stock: 20, rating: 5, reviews: 10, pack: 'bread', blurb: 'The big everyday loaf. Toasts better than it slices.' },
  { id: 'balviten-royal-bread-250g', name: 'Gluten-Free Royal Bread', brand: 'Balviten', category: 'gluten-free', price: 3.65, oldPrice: 4.20, size: '250 g', diets: ['gluten-free','vegan'], stock: 24, rating: 5, reviews: 8, pack: 'bread', blurb: 'Soft white crumb, long shelf life unopened.' },
  { id: 'balviten-royal-seeds-250g', name: 'Gluten-Free Royal Bread with Seeds', brand: 'Balviten', category: 'gluten-free', price: 3.95, size: '250 g', diets: ['gluten-free','vegan'], stock: 22, rating: 5, reviews: 3, pack: 'bread', blurb: 'Sunflower and linseed through the loaf.' },
  { id: 'balviten-royal-farmer-250g', name: 'Bio Gluten-Free Royal Farmer Bread', brand: 'Balviten', category: 'gluten-free', price: 4.50, size: '250 g', diets: ['gluten-free','vegan','organic'], stock: 18, rating: 0, reviews: 0, pack: 'bread', blurb: 'Darker and denser, closer to a rye.' },
  { id: 'balviten-whole-grain-250g', name: 'Bio Gluten-Free Whole Grain Bread', brand: 'Balviten', category: 'gluten-free', price: 4.50, size: '250 g', diets: ['gluten-free','vegan','organic'], stock: 17, rating: 0, reviews: 0, pack: 'bread', blurb: 'Wholegrain flours, more fibre per slice.' },
  { id: 'balviten-every-day-300g', name: 'Gluten-Free Every Day Bread', brand: 'Balviten', category: 'gluten-free', price: 3.35, size: '300 g', diets: ['gluten-free','vegan'], stock: 26, rating: 5, reviews: 3, pack: 'bread', blurb: 'The cheapest loaf we carry, and the one that sells fastest.' },
  { id: 'balviten-low-carb-190g', name: 'Gluten-Free Low Carb Bread', brand: 'Balviten', category: 'no-sugar', price: 4.90, size: '190 g', diets: ['gluten-free','no-sugar'], stock: 14, rating: 0, reviews: 0, pack: 'bread', blurb: 'Built around seeds and protein rather than starch.' },
  { id: 'balviten-royal-rolls-130g', name: 'Gluten-Free Royal Bread Rolls', brand: 'Balviten', category: 'gluten-free', price: 2.95, size: '130 g', diets: ['gluten-free','vegan'], stock: 30, rating: 5, reviews: 5, pack: 'bread', blurb: 'Two small rolls. Warm them for two minutes first.' },
  { id: 'balviten-burger-rolls-140g', name: 'Gluten-Free Hamburger Rolls', brand: 'Balviten', category: 'gluten-free', price: 3.90, size: '2 × 70 g', diets: ['gluten-free','vegan'], stock: 19, rating: 0, reviews: 0, pack: 'bread', blurb: 'Holds together under a burger, which is not a given.' },
  { id: 'balviten-pizza-base-300g', name: 'Gluten-Free Pizza Base', brand: 'Balviten', category: 'gluten-free', price: 6.95, size: '2 × 150 g', diets: ['gluten-free','vegan'], stock: 0, rating: 0, reviews: 0, pack: 'box', blurb: 'Two pre-baked bases. Top and bake for ten minutes.' },

  /* -------------------------------------------------------- Santiveri */
  { id: 'santiveri-fructose-750g', name: 'Fructose in Bag', brand: 'Santiveri', category: 'no-sugar', price: 5.30, oldPrice: 6.20, size: '750 g', diets: ['no-sugar','vegan','gluten-free'], stock: 34, rating: 5, reviews: 5, pack: 'pouch', blurb: 'Sweeter than sugar, so you use roughly a third less.' },
  { id: 'santiveri-stevia-liquid-90ml', name: 'Stevia Liquid, gluten free', brand: 'Santiveri', category: 'no-sugar', price: 5.90, size: '90 ml', diets: ['no-sugar','vegan','gluten-free'], stock: 28, rating: 5, reviews: 8, pack: 'bottle', blurb: 'A few drops sweeten a whole cafetière. Keeps for months.' },
  { id: 'santiveri-jungla-biscuits-100g', name: 'Gluten Free Jungla Biscuits', brand: 'Santiveri', category: 'gluten-free', price: 1.95, size: '100 g', diets: ['gluten-free'], stock: 46, rating: 5, reviews: 2, pack: 'box', blurb: 'Animal-shaped biscuits. The gluten-free lunchbox standby.' },

  /* ---------------------------------------------------------- Verival */
  { id: 'verival-maple-syrup-250ml', name: 'Bio Maple Syrup Grade A', brand: 'Verival', category: 'organic', price: 9.35, size: '250 ml', diets: ['organic','vegan','gluten-free'], stock: 16, rating: 5, reviews: 2, pack: 'bottle', blurb: 'Single-grade Canadian syrup, bottled in Austria.' },
  { id: 'verival-muesli-coconut-325g', name: 'Bio Muesli Coconut & Apricot, gluten free', brand: 'Verival', category: 'gluten-free', price: 5.50, size: '325 g', diets: ['organic','vegan','gluten-free'], stock: 0, rating: 5, reviews: 8, pack: 'box', blurb: 'Our best-selling breakfast box. Sells out most months.' },

  /* ------------------------------------------------------- Biovlastos */
  { id: 'biovlastos-all-purpose-flour-1kg', name: 'Bio All-Purpose Flour 70%', brand: 'Biovlastos', category: 'organic', price: 4.35, size: '1000 g', diets: ['organic','vegan'], stock: 32, rating: 0, reviews: 0, pack: 'pouch', blurb: 'The everyday bag: bread, pastry, béchamel.' },
  { id: 'biovlastos-durum-flour-1kg', name: 'Bio Durum Whole Wheat Flour', brand: 'Biovlastos', category: 'organic', price: 4.35, size: '1000 g', diets: ['organic','vegan'], stock: 28, rating: 0, reviews: 0, pack: 'pouch', blurb: 'Coarser and golden. Made for pasta and village bread.' },
  { id: 'biovlastos-emmer-flour-1kg', name: 'Bio Emmer Whole Flour (Dikokko)', brand: 'Biovlastos', category: 'organic', price: 5.50, size: '1000 g', diets: ['organic','vegan'], stock: 15, rating: 0, reviews: 0, pack: 'pouch', blurb: 'An ancient wheat — nuttier, and easier on some stomachs.' },
  { id: 'biovlastos-oat-flakes-de-500g', name: 'Bio Oat Flakes (German)', brand: 'Biovlastos', category: 'organic', price: 2.60, size: '500 g', diets: ['organic','vegan'], stock: 40, rating: 0, reviews: 0, pack: 'box', blurb: 'Fine flakes that cook down to a smooth porridge.' },
  { id: 'biovlastos-oat-flakes-gr-500g', name: 'Bio Oat Flakes (Greek)', brand: 'Biovlastos', category: 'organic', price: 2.60, size: '500 g', diets: ['organic','vegan'], stock: 38, rating: 0, reviews: 0, pack: 'box', blurb: 'Thicker cut, keeps its bite in muesli.' },
  { id: 'biovlastos-cous-cous-500g', name: 'Bio Cous Cous', brand: 'Biovlastos', category: 'organic', price: 6.10, oldPrice: 7.20, size: '500 g', diets: ['organic','vegan'], stock: 21, rating: 0, reviews: 0, pack: 'box', blurb: 'Five minutes off the heat and it is done.' },
  { id: 'biovlastos-kritharaki-500g', name: 'Bio Kritharaki', brand: 'Biovlastos', category: 'organic', price: 3.40, size: '500 g', diets: ['organic','vegan'], stock: 35, rating: 0, reviews: 0, pack: 'box', blurb: 'Orzo for youvetsi. Organic durum, bronze-cut.' },
  { id: 'biovlastos-koxilaki-500g', name: 'Bio Koxilaki', brand: 'Biovlastos', category: 'organic', price: 3.20, size: '500 g', diets: ['organic','vegan'], stock: 33, rating: 0, reviews: 0, pack: 'box', blurb: 'Small shells that hold a tomato sauce well.' },
  { id: 'biovlastos-banana-chips-200g', name: 'Bio Banana Chips', brand: 'Biovlastos', category: 'organic', price: 2.90, size: '200 g', diets: ['organic','vegan','gluten-free'], stock: 37, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Crisp, lightly sweet, good in a trail mix.' },
  { id: 'biovlastos-damaskina-200g', name: 'Bio Damaskina (Dried Plums)', brand: 'Biovlastos', category: 'organic', price: 6.75, size: '200 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 23, rating: 0, reviews: 0, pack: 'sachet', blurb: 'Soft, pitted, no sulphites and no added sugar.' },
  { id: 'biovlastos-date-cacao-220g', name: 'Bio Date & Cacao Spread', brand: 'Biovlastos', category: 'no-sugar', price: 7.50, size: '220 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 18, rating: 0, reviews: 0, pack: 'jar', blurb: 'Sweetened entirely by dates. Tastes like a soft brownie.' },
  { id: 'biovlastos-date-carob-220g', name: 'Bio Date & Carob Spread', brand: 'Biovlastos', category: 'no-sugar', price: 7.50, size: '220 g', diets: ['organic','vegan','gluten-free','no-sugar'], stock: 19, rating: 0, reviews: 0, pack: 'jar', blurb: 'Cyprus carob instead of cocoa. Caffeine free.' },

  /* --------------------------------------------------------- Sudanta */
  { id: 'sudanta-toothpaste-100g', name: 'EcoCert Ayurvedic Herbal Toothpaste', brand: 'Sudanta', category: 'natural', price: 6.90, size: '100 g', diets: ['vegan'], stock: 25, rating: 0, reviews: 0, pack: 'tube', blurb: 'No fluoride and no foaming agents. Twenty-six herbs.' }
];
