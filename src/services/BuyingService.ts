import { supabase } from "../api/supabase";
import { ApiError } from "./ApiError";

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
  zoneName: string;
  buyItem: BuyItemRow[];
};

export async function getBuyItems(groceryId: number) {
  const { data, error } = await supabase
    .from("BuyItems")
    .select("ingredientId,name,unit,zoneName,zoneId,total,checked,groceryIngredientId")
    .eq("groceryId", groceryId);

  if (error) throw new ApiError(error.message, error.code);

  return data;
}

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
