// Meal planner: filter the meal DB by slot/diet/goal/allergy, build a day plan,
// generate a grocery list, print/PDF export. Deterministic selection.
import { useMemo, useState } from 'react';
import { Printer, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import mealData from '@/data/meal.db.json';

interface Meal {
  id: string;
  name: string;
  slot: string;
  kcal: number;
  protein_g: number;
  vegetarian: boolean;
  diets: string[];
  allergens: string[];
  goals: string[];
  tags: string[];
}

const MEALS = mealData.meals as Meal[];
const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'] as const;

/** Simple ingredient keyword extraction from meal name (deterministic, offline). */
function groceryItems(dayMeals: Meal[]): Array<{ item: string; count: number }> {
  const KEYWORDS = [
    'rice', 'chapati', 'dosa', 'idli', 'curd', 'egg', 'chicken', 'fish', 'paneer',
    'dal', 'sambar', 'rasam', 'banana', 'apple', 'peanuts', 'chana', 'oats',
    'milk', 'tea', 'coffee', 'bread', 'salad', 'soup', 'paratha', 'naan', 'roti', 'phulka',
  ];
  const counts = new Map<string, number>();
  for (const m of dayMeals) {
    const lower = m.name.toLowerCase();
    for (const kw of KEYWORDS) {
      if (lower.includes(kw)) counts.set(kw, (counts.get(kw) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([item, count]) => ({ item, count })).sort((a, b) => b.count - a.count);
}

export default function MealPlanner({ profile }: { profile?: { goal?: string; diet?: string; allergies?: string[] } }) {
  const [goal, setGoal] = useState(profile?.goal ?? 'general-health');
  const [diet, setDiet] = useState(profile?.diet ?? 'vegetarian');
  const [avoid, setAvoid] = useState<string[]>([]);
  const [plan, setPlan] = useState<Meal[] | null>(null);

  const candidates = useMemo(
    () =>
      MEALS.filter(
        (m) =>
          m.goals.includes(goal) &&
          m.diets.includes(diet) &&
          !m.allergens.some((a) => avoid.includes(a)),
      ),
    [goal, diet, avoid],
  );

  const generatePlan = () => {
    // Pick highest-protein-per-kcal for each slot deterministically.
    const picked: Meal[] = [];
    for (const slot of SLOTS) {
      const pool = candidates.filter((m) => m.slot === slot);
      if (pool.length === 0) continue;
      const best = [...pool].sort((a, b) => b.protein_g / Math.max(1, b.kcal) - a.protein_g / Math.max(1, a.kcal))[0];
      picked.push(best);
    }
    setPlan(picked);
  };

  const totalKcal = plan?.reduce((a, m) => a + m.kcal, 0) ?? 0;
  const totalProtein = plan?.reduce((a, m) => a + m.protein_g, 0) ?? 0;
  const groceries = plan ? groceryItems(plan) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-slate-500">
          Goal
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 block rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100">
            <option value="weight-loss">Weight loss</option>
            <option value="muscle-gain">Muscle gain</option>
            <option value="general-health">General health</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-500">
          Diet
          <select value={diet} onChange={(e) => setDiet(e.target.value)} className="mt-1 block rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100">
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="non-vegetarian">Non-vegetarian</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {['dairy', 'egg', 'gluten', 'peanuts', 'fish', 'soy'].map((a) => (
            <button
              key={a}
              onClick={() => setAvoid((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${avoid.includes(a) ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}
            >
              no {a}
            </button>
          ))}
        </div>
        <button onClick={generatePlan} className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-400">
          <UtensilsCrossed size={13} /> Generate today's plan
        </button>
        {plan && (
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-full bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-gray-100">
            <Printer size={13} /> Print / PDF
          </button>
        )}
      </div>

      {candidates.length === 0 && (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm italic text-slate-400">
          No meals match those filters — try removing an allergy or switching diet mode.
        </p>
      )}

      {plan && plan.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700" id="meal-plan-sheet">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                <tr><th className="p-2.5">Meal</th><th className="p-2.5">Food</th><th className="p-2.5">kcal</th><th className="p-2.5">Protein</th></tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800">
                {plan.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="p-2.5 font-bold capitalize text-cyan-600">{m.slot}</td>
                    <td className="p-2.5 text-gray-800 dark:text-gray-100">{m.name}</td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-300">{m.kcal}</td>
                    <td className="p-2.5 text-gray-600 dark:text-gray-300">{m.protein_g}g</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-black dark:border-slate-600 dark:bg-slate-900">
                  <td className="p-2.5" colSpan={2}>Total</td>
                  <td className="p-2.5 text-emerald-600">{totalKcal}</td>
                  <td className="p-2.5 text-emerald-600">{totalProtein}g</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
              <ShoppingCart size={15} className="text-lime-500" /> Grocery list (from today's plan)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {groceries.map((g) => (
                <span key={g.item} className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold capitalize text-lime-800 dark:bg-lime-900/40 dark:text-lime-300">
                  {g.item} ×{g.count}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[10px] leading-relaxed text-slate-400">{mealData.meta.note}</p>
        </>
      )}
    </div>
  );
}
