import { supabase } from "../api/supabase";

export type IngredientRow = {
    id: number;
    name: string;
    unit?: string | null;
    zoneId: number;
};

export type RecipeRow = {
  id: number;
  name: string;
  createdAt: string;
};

export type RecipeIngredientRow = {
    recipeId: number,
    ingredientId: number,
    quantity: number,
}

export class ApiError extends Error {
  public code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
};

export async function getIngredients() {
    const { data, error } = await supabase
        .from("Ingredient")
        .select("id,name,unit,zoneId")
        .order("name", { ascending: true });

    if (error) throw new ApiError(error.message, error.code)

    return data;
};

export async function getRecipes() {
    const { data, error } = await supabase
        .from("Recipe")
        .select("id,name,createdAt")
        .order("createdAt", { ascending: false });

    if (error) throw new ApiError(error.message, error.code)

    return data;
};

export async function insertRecipe(name: string): Promise<RecipeRow> {
    const { data, error } = await supabase
        .from("Recipe")
        .insert({
            name: name,
        })
        .select()
        .single();

    if (error) throw new ApiError(error.message, error.code);

    return data;
}

export async function insertRecipeIngredient(rows: RecipeIngredientRow[]) {
    const { data, error } = await supabase
        .from("RecipeIngredient")
        .insert(rows)

    if (error) throw new ApiError(error.message, error.code);

    return data;
}