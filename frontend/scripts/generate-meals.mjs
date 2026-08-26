// Generates the HIRA meal database: ~72 everyday Indian meals with labeled
// approximate nutrition (educational estimates, not medical data).
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// [name, kcal, protein g, veg, allergens, mealSlot]
const M = [
  // Breakfast (veg-heavy South Indian + common)
  ['Idli (3) with sambar', 250, 9, true, [], 'breakfast'],
  ['Plain dosa (2)', 280, 7, true, [], 'breakfast'],
  ['Masala dosa', 385, 8, true, [], 'breakfast'],
  ['Pongal with ghee', 340, 9, true, ['dairy'], 'breakfast'],
  ['Upma', 290, 7, true, ['nuts'], 'breakfast'],
  ['Poha', 270, 6, true, [], 'breakfast'],
  ['Rava kesari (small)', 300, 4, true, ['dairy'], 'breakfast'],
  ['Medu vada (2)', 330, 8, true, [], 'breakfast'],
  ['Boiled egg (2) + toast', 300, 16, false, ['egg', 'gluten'], 'breakfast'],
  ['Omelette (2)', 220, 14, false, ['egg'], 'breakfast'],
  ['Bread butter jam', 310, 7, true, ['dairy', 'gluten'], 'breakfast'],
  ['Corn flakes + milk', 260, 11, true, ['dairy'], 'breakfast'],
  ['Oats porridge with banana', 290, 9, true, [], 'breakfast'],
  ['Wheat puttu with kadala curry', 380, 13, true, [], 'breakfast'],
  ['Chapati (2) with curd', 320, 12, true, ['dairy', 'gluten'], 'breakfast'],
  ['Banana milkshake', 280, 9, true, ['dairy'], 'breakfast'],
  ['Sprout salad', 180, 11, true, [], 'breakfast'],
  ['Peanut chikki bar', 210, 7, true, ['peanuts'], 'breakfast'],
  ['Ragi kanji', 190, 7, true, [], 'breakfast'],
  ['Veg sandwich grilled', 330, 10, true, ['gluten', 'dairy'], 'breakfast'],
  ['Paneer paratha (1)', 350, 14, true, ['dairy', 'gluten'], 'breakfast'],
  ['Egg bhurji + chapati', 360, 18, false, ['egg', 'gluten'], 'breakfast'],
  ['Semiya upma', 280, 7, true, ['gluten'], 'breakfast'],
  ['Appam with coconut milk', 300, 6, true, [], 'breakfast'],

  // Lunch
  ['Sambar rice', 420, 12, true, [], 'lunch'],
  ['Curd rice with pickle', 380, 11, true, ['dairy'], 'lunch'],
  ['Rasam rice', 360, 9, true, [], 'lunch'],
  ['Lemon rice', 400, 8, true, ['peanuts'], 'lunch'],
  ['Biryani (veg)', 520, 13, true, ['dairy'], 'lunch'],
  ['Chicken biryani', 650, 28, false, ['dairy'], 'lunch'],
  ['Chapati (3) + dal + sabzi', 480, 17, true, ['gluten'], 'lunch'],
  ['Rice + chicken curry', 560, 30, false, [], 'lunch'],
  ['Rice + fish curry', 500, 27, false, ['fish'], 'lunch'],
  ['Rice + egg curry', 480, 22, false, ['egg'], 'lunch'],
  ['Curd rice + appalam', 410, 12, true, ['dairy'], 'lunch'],
  ['Tomato rice', 390, 8, true, ['peanuts'], 'lunch'],
  ['Curd rice + veg poriyal', 430, 13, true, ['dairy'], 'lunch'],
  ['Parotta + salna', 560, 15, true, ['gluten'], 'lunch'],
  ['Fried rice (veg)', 510, 12, true, ['soy'], 'lunch'],
  ['Paneer butter masala + naan', 640, 20, true, ['dairy', 'gluten'], 'lunch'],
  ['Fish fry + rice', 520, 30, false, ['fish'], 'lunch'],
  ['Kichadi (moong dal rice)', 420, 16, true, [], 'lunch'],
  ['Sambar + idli (4)', 450, 14, true, [], 'lunch'],

  // Dinner
  ['Chapati (2) + dal', 380, 14, true, ['gluten'], 'dinner'],
  ['Idli (3) + chutney', 240, 8, true, [], 'dinner'],
  ['Dosa (2) + chutney', 300, 7, true, [], 'dinner'],
  ['Wheat dosa', 290, 9, true, ['gluten'], 'dinner'],
  ['Rice + rasam + poriyal', 400, 10, true, [], 'dinner'],
  ['Phulka (3) + sabzi', 400, 12, true, ['gluten'], 'dinner'],
  ['Grilled chicken (150g) + salad', 380, 35, false, [], 'dinner'],
  ['Fish curry + chapati', 470, 26, false, ['fish', 'gluten'], 'dinner'],
  ['Egg curry + 2 chapati', 460, 21, false, ['egg', 'gluten'], 'dinner'],
  ['Paneer tikka (dry)', 320, 19, true, ['dairy'], 'dinner'],
  ['Moong soup + toast', 250, 12, true, ['gluten'], 'dinner'],
  ['Vegetable clear soup + fruit', 180, 5, true, [], 'dinner'],
  ['Curd rice (light)', 300, 10, true, ['dairy'], 'dinner'],
  ['Ragi dosa (2)', 260, 8, true, [], 'dinner'],
  ['Oats upma', 270, 9, true, [], 'dinner'],
  ['Khichdi with veggies', 390, 14, true, [], 'dinner'],
  ['Roti + palak paneer', 450, 18, true, ['dairy', 'gluten'], 'dinner'],
  ['Chapati roll (veg)', 350, 11, true, ['gluten'], 'dinner'],

  // Snacks
  ['Banana', 105, 1, true, [], 'snack'],
  ['Apple', 95, 0, true, [], 'snack'],
  ['Handful of peanuts', 160, 7, true, ['peanuts'], 'snack'],
  ['Roasted chana', 160, 9, true, [], 'snack'],
  ['Buttermilk', 60, 3, true, ['dairy'], 'snack'],
  ['Filter coffee (with milk+sugar)', 90, 2, true, ['dairy'], 'snack'],
  ['Tea with milk', 70, 2, true, ['dairy'], 'snack'],
  ['Boiled egg', 78, 6, false, ['egg'], 'snack'],
  ['Sundal (chickpea)', 190, 9, true, [], 'snack'],
  ['Murmura puffed rice', 110, 3, true, ['peanuts'], 'snack'],
  ['Curd with fruits', 180, 8, true, ['dairy'], 'snack'],
  ['Protein: 200g curd + nuts', 240, 12, true, ['dairy', 'nuts'], 'snack'],
];

const GOALS = ['weight-loss', 'muscle-gain', 'general-health'];
const DIETS = ['vegetarian', 'eggetarian', 'non-vegetarian'];

function tagsFor(kcal, protein) {
  const t = [];
  if (kcal <= 300) t.push('low-calorie');
  if (protein >= 20) t.push('high-protein');
  if (protein >= 12 && protein < 20) t.push('protein-moderate');
  return t;
}

const meals = M.map(([name, kcal, protein, veg, allergens, slot], i) => ({
  id: `meal-${String(i + 1).padStart(3, '0')}`,
  name,
  slot,
  kcal,
  protein_g: protein,
  vegetarian: veg,
  diets: [
    ...(veg ? DIETS : ['eggetarian', 'non-vegetarian']),
    ...(slot === 'snack' ? [] : []),
  ],
  allergens,
  goals: [...GOALS.filter((g) => (g === 'weight-loss' ? kcal <= 420 : g === 'muscle-gain' ? protein >= 15 : true))],
  tags: tagsFor(kcal, protein),
}));

const out = {
  meta: {
    generated_by: 'scripts/generate-meals.mjs',
    count: meals.length,
    note: 'Approximate nutrition for general education only. Values vary by recipe and portion. Not medical or dietary advice.',
  },
  meals,
};

writeFileSync(resolve(__dirname, '../src/data/meal.db.json'), JSON.stringify(out, null, 1));
console.log(`Wrote ${meals.length} meals -> src/data/meal.db.json`);

