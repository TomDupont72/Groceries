import { getBuyItems, upsertGroceryIngredient } from "../BuyingService";
import { ApiError } from "../ApiError";
import { supabase } from "../../api/supabase";

jest.mock("../../api/supabase", () => ({
  supabase: { from: jest.fn() },
}));

describe("BuyingService", () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeAll(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe("getBuyItems", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = {
        data: [
          {
            ingredientId: 3,
            name: "Tomate",
            unit: "g",
            zoneName: "Légumes",
            zoneId: 1,
            total: 200,
            checked: false,
            groceryIngredientId: null,
          },
        ],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: async () => result,
        }),
      });

      const data = await getBuyItems(7);

      expect(supabase.from).toHaveBeenCalledWith("BuyItems");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: async () => ({
            data: null,
            error: { message: "select failed", code: "42501" },
          }),
        }),
      });

      await expect(getBuyItems(7)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("upsertGroceryIngredient", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: { id: 1, ingredientId: 3, checked: true }, error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: () => ({
          single: async () => result,
        }),
      });

      const data = await upsertGroceryIngredient(3, true);

      expect(supabase.from).toHaveBeenCalledWith("GroceryIngredient");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: () => ({
          single: async () => ({
            data: null,
            error: { message: "upsert failed", code: "42501" },
          }),
        }),
      });

      await expect(upsertGroceryIngredient(3, true)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
