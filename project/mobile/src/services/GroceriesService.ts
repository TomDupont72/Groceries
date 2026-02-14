import { supabase } from "../api/supabase";

export type RecipeRow = {
  id: number;
  name: string;
};

export type GroceryLineRow = {
  id: number;
  groceryId: number;
  recipeId: number;
  quantity: number;
  recipe: any;
};

export type GroceryRecipeRow = {
    groceryId: number,
    recipeId: number,
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

export async function getGrocery() {
    const { data, error } = await supabase
        .from("Grocery")
        .select("id")
        .single();

    if (error) throw new ApiError(error.message, error.code);

    return data;
};

export async function insertGrocery() {
    const { data, error } = await supabase
        .from("Grocery")
        .insert({})
        .select("id")
        .single();

    if (error) throw new ApiError(error.message, error.code);


    return data;
};

export async function getRecipes() {
    const { data, error } = await supabase
        .from("Recipe")
        .select("id,name")
        .order("name", { ascending: true });

    if (error) throw new ApiError(error.message, error.code);

    return data;
}

export async function getGroceryRecipe(groceryId: number) {
    const { data, error } = await supabase
        .from("GroceryRecipe")
        .select("id,groceryId,recipeId,quantity,recipe:Recipe(name)")
        .eq("groceryId", groceryId);

    if (error) throw new ApiError(error.message, error.code);

    return data;
}

export async function insertGroceryRecipe(rows: GroceryRecipeRow[]) {
    const { data, error } = await supabase
            .from("GroceryRecipe")
            .insert(rows)
    
        if (error) throw new ApiError(error.message, error.code);
    
        return data;
}