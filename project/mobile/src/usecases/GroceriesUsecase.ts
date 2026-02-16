import { getGrocery, insertGrocery } from "../services/GroceriesService";

export async function getOrCreateGroceryId() {
  try {
    const dataGrocery = await getGrocery();

    if (dataGrocery?.id != null) return dataGrocery.id;

    const dataGroceryInserted = await insertGrocery();

    return dataGroceryInserted.id;
  } catch (error) {
    console.error("[GroceriesUsecase.getOrCreateGroceryId] failed", error);
  }
}
