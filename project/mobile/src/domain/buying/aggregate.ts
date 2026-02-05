export type Id = string;

export type Zone = {
  id: Id;
  name: string;
};

export type Ingredient = {
  id: Id;
  name: string;
  unit: string | null;
  zoneId: Id | null;
};

export type GroceryRecipe = {
  recipeId: Id;
  quantity: number; // how many times this recipe is added to the grocery
};

export type RecipeIngredient = {
  recipeId: Id;
  ingredientId: Id;
  quantity: number; // quantity for 1 recipe
  optional: boolean;
};

export type BuyingItem = {
  ingredientId: Id;
  ingredientName: string;
  unit: string | null;
  zoneId: Id | null;
  zoneName: string; // fallback "Sans zone" if unknown/null
  totalQty: number;
  checked: boolean; // can be attached later from GroceryIngredient table
};

export type AggregateOptions = {
  includeOptional?: boolean; // default true
  unknownZoneLabel?: string; // default "Sans zone"
  checkedByIngredientId?: Record<Id, boolean>; // optional
};

function safeNumber(x: unknown): number {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : 0;
}

export function aggregateBuyingItems(params: {
  zones: Zone[];
  ingredients: Ingredient[];
  groceryRecipes: GroceryRecipe[];
  recipeIngredients: RecipeIngredient[];
  options?: AggregateOptions;
}): BuyingItem[] {
  const {
    zones,
    ingredients,
    groceryRecipes,
    recipeIngredients,
    options,
  } = params;

  const includeOptional = options?.includeOptional ?? true;
  const unknownZoneLabel = options?.unknownZoneLabel ?? "Sans zone";
  const checkedByIngredientId = options?.checkedByIngredientId ?? {};

  const zoneById = new Map<Id, Zone>();
  for (const z of zones) zoneById.set(z.id, z);

  const ingredientById = new Map<Id, Ingredient>();
  for (const ing of ingredients) ingredientById.set(ing.id, ing);

  // recipeId -> multiplier (qty in grocery)
  const recipeMultiplier = new Map<Id, number>();
  for (const gr of groceryRecipes) {
    const m = safeNumber(gr.quantity);
    if (m <= 0) continue;
    recipeMultiplier.set(gr.recipeId, m);
  }

  // ingredientId -> total quantity
  const totals = new Map<Id, number>();

  for (const ri of recipeIngredients) {
    if (!includeOptional && ri.optional) continue;

    const mult = recipeMultiplier.get(ri.recipeId) ?? 0;
    if (mult <= 0) continue;

    const perRecipe = safeNumber(ri.quantity);
    if (perRecipe === 0) continue;

    const add = mult * perRecipe;
    const prev = totals.get(ri.ingredientId) ?? 0;
    totals.set(ri.ingredientId, prev + add);
  }

  const items: BuyingItem[] = [];
  for (const [ingredientId, totalQtyRaw] of totals.entries()) {
    const ing = ingredientById.get(ingredientId);
    if (!ing) continue; // ingredient deleted => ignore

    const zone =
      (ing.zoneId && zoneById.get(ing.zoneId)) || undefined;

    items.push({
      ingredientId,
      ingredientName: ing.name,
      unit: ing.unit,
      zoneId: ing.zoneId,
      zoneName: zone?.name ?? unknownZoneLabel,
      totalQty: totalQtyRaw,
      checked: checkedByIngredientId[ingredientId] ?? false,
    });
  }

  // stable ordering: zoneName ASC then ingredientName ASC
  items.sort((a, b) => {
    const z = a.zoneName.localeCompare(b.zoneName);
    if (z !== 0) return z;
    return a.ingredientName.localeCompare(b.ingredientName);
  });

  return items;
}

export type BuyingGroup = {
  zoneName: string;
  items: BuyingItem[];
};

export function groupBuyingItemsByZone(items: BuyingItem[]): BuyingGroup[] {
  const groups = new Map<string, BuyingItem[]>();

  for (const item of items) {
    const key = item.zoneName;
    const arr = groups.get(key) ?? [];
    arr.push(item);
    groups.set(key, arr);
  }

  const res: BuyingGroup[] = [...groups.entries()].map(([zoneName, it]) => {
    it.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
    return { zoneName, items: it };
  });

  res.sort((a, b) => a.zoneName.localeCompare(b.zoneName));
  return res;
}
