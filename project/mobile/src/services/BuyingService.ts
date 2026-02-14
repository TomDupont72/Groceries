import { supabase } from "../api/supabase";

export type BuyItemRow = {
  ingredientId: number;
  name: string;
  unit: string | null;
  zoneName: string;
  zoneId: number;
  total: number;
  checked: boolean;
  groceryIngredientId: number | null;
};

export type GroupedBuyItemRow = {
    zoneId: number,
    zoneName: string,
    buyItem: BuyItemRow[],
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

export async function getBuyItems(groceryId: number) {
    const { data, error } = await supabase
        .from("BuyItems")
        .select("ingredientId,name,unit,zoneName,zoneId,total,checked,groceryIngredientId")
        .eq("groceryId", groceryId);

    if (error) throw new ApiError(error.message, error.code);

    return data;
};

export async function upsertGroceryIngredient(ingrdientId: number, checked: boolean) {
    const { data, error } = await supabase
        .from("GroceryIngredient")
        .upsert({
            ingredientId: ingrdientId,
            checked: checked,
        })
        .single();

    if (error) throw new ApiError(error.message, error.code);

    return data;
}