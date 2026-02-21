import { supabase } from "../api/supabase";
import { ApiError } from "./ApiError";

export type ZoneRow = {
  id: number;
  name: string;
};

export async function insertIngredient(name: string, unit: string, zoneId: number) {
  const { data, error } = await supabase
    .from("Ingredient")
    .insert({
      name: name,
      unit: unit,
      zoneId: zoneId,
    })
    .select()
    .single();

  if (error) throw new ApiError(error.message, error.code);

  return data;
}

export async function getZones(): Promise<ZoneRow[]> {
  const { data, error } = await supabase
    .from("Zone")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new ApiError(error.message, error.code);

  return data ?? [];
}
