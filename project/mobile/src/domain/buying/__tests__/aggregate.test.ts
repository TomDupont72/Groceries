import {
  aggregateBuyingItems,
  groupBuyingItemsByZone,
  Ingredient,
  Zone,
  GroceryRecipe,
  RecipeIngredient,
} from "../aggregate";

describe("aggregateBuyingItems", () => {
  const zones: Zone[] = [
    { id: "z1", name: "Fruits" },
    { id: "z2", name: "Épicerie" },
  ];

  const ingredients: Ingredient[] = [
    { id: "i1", name: "Tomate", unit: "pcs", zoneId: "z1" },
    { id: "i2", name: "Pâtes", unit: "g", zoneId: "z2" },
    { id: "i3", name: "Sel", unit: "g", zoneId: null },
  ];

  it("aggregates Σ(groceryRecipeQty * recipeIngredientQty)", () => {
    const groceryRecipes: GroceryRecipe[] = [
      { recipeId: "r1", quantity: 2 },
      { recipeId: "r2", quantity: 1 },
    ];

    const recipeIngredients: RecipeIngredient[] = [
      { recipeId: "r1", ingredientId: "i1", quantity: 3, optional: false }, // 2*3=6
      { recipeId: "r1", ingredientId: "i2", quantity: 100, optional: false }, // 2*100=200
      { recipeId: "r2", ingredientId: "i2", quantity: 50, optional: false }, // 1*50=50 => total i2=250
    ];

    const items = aggregateBuyingItems({
      zones,
      ingredients,
      groceryRecipes,
      recipeIngredients,
    });

    const tomate = items.find((x) => x.ingredientId === "i1");
    const pates = items.find((x) => x.ingredientId === "i2");

    expect(tomate?.totalQty).toBe(6);
    expect(pates?.totalQty).toBe(250);
  });

  it("sums shared ingredients across recipes", () => {
    const groceryRecipes: GroceryRecipe[] = [
      { recipeId: "r1", quantity: 1 },
      { recipeId: "r2", quantity: 3 },
    ];

    const recipeIngredients: RecipeIngredient[] = [
      { recipeId: "r1", ingredientId: "i1", quantity: 2, optional: false }, // 2
      { recipeId: "r2", ingredientId: "i1", quantity: 1, optional: false }, // 3*1=3 => total 5
    ];

    const items = aggregateBuyingItems({
      zones,
      ingredients,
      groceryRecipes,
      recipeIngredients,
    });

    expect(items.find((x) => x.ingredientId === "i1")?.totalQty).toBe(5);
  });

  it("can exclude optional ingredients", () => {
    const groceryRecipes: GroceryRecipe[] = [{ recipeId: "r1", quantity: 1 }];

    const recipeIngredients: RecipeIngredient[] = [
      { recipeId: "r1", ingredientId: "i3", quantity: 10, optional: true },
    ];

    const itemsIncluded = aggregateBuyingItems({
      zones,
      ingredients,
      groceryRecipes,
      recipeIngredients,
      options: { includeOptional: true },
    });
    expect(itemsIncluded.find((x) => x.ingredientId === "i3")?.totalQty).toBe(10);

    const itemsExcluded = aggregateBuyingItems({
      zones,
      ingredients,
      groceryRecipes,
      recipeIngredients,
      options: { includeOptional: false },
    });
    expect(itemsExcluded.find((x) => x.ingredientId === "i3")).toBeUndefined();
  });

  it("assigns zone label and groups by zone", () => {
    const groceryRecipes: GroceryRecipe[] = [{ recipeId: "r1", quantity: 1 }];

    const recipeIngredients: RecipeIngredient[] = [
      { recipeId: "r1", ingredientId: "i1", quantity: 1, optional: false },
      { recipeId: "r1", ingredientId: "i3", quantity: 1, optional: false }, // zone null => "Sans zone"
    ];

    const items = aggregateBuyingItems({
      zones,
      ingredients,
      groceryRecipes,
      recipeIngredients,
    });

    expect(items.find((x) => x.ingredientId === "i1")?.zoneName).toBe("Fruits");
    expect(items.find((x) => x.ingredientId === "i3")?.zoneName).toBe("Sans zone");

    const groups = groupBuyingItemsByZone(items);
    expect(groups.map((g) => g.zoneName)).toEqual(["Fruits", "Sans zone"]);
    expect(groups.find((g) => g.zoneName === "Fruits")?.items).toHaveLength(1);
    expect(groups.find((g) => g.zoneName === "Sans zone")?.items).toHaveLength(1);
  });

  it("attaches checked state when provided", () => {
    const groceryRecipes: GroceryRecipe[] = [{ recipeId: "r1", quantity: 1 }];
    const recipeIngredients: RecipeIngredient[] = [
      { recipeId: "r1", ingredientId: "i2", quantity: 1, optional: false },
    ];

    const items = aggregateBuyingItems({
      zones,
      ingredients,
      groceryRecipes,
      recipeIngredients,
      options: { checkedByIngredientId: { i2: true } },
    });

    expect(items[0].checked).toBe(true);
  });
});
