import {
  getIngredients,
  getRecipes,
  insertRecipe,
  insertRecipeIngredient,
  ApiError,
} from "../RecipesService";
import { supabase } from "../../api/supabase";

jest.mock("../../api/supabase", () => ({
  supabase: { from: jest.fn() },
}));

describe("RecipesService", () => {
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

  describe("getIngredients", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = {
        data: [{ id: 1, name: "Tomate", unit: "g", zoneId: 1 }],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: async () => result,
        }),
      });

      const data = await getIngredients();

      expect(supabase.from).toHaveBeenCalledWith("Ingredient");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: async () => ({
            data: null,
            error: { message: "select failed", code: "42501" },
          }),
        }),
      });

      await expect(getIngredients()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("getRecipes", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = {
        data: [{ id: 10, name: "Salade", createdAt: "2025-01-01T00:00:00.000Z" }],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: async () => result,
        }),
      });

      const data = await getRecipes();

      expect(supabase.from).toHaveBeenCalledWith("Recipe");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: async () => ({
            data: null,
            error: { message: "select failed", code: "42501" },
          }),
        }),
      });

      await expect(getRecipes()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("insertRecipe", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = {
        data: { id: 99, name: "Salade", createdAt: "2025-01-01T00:00:00.000Z" },
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: async () => result,
          }),
        }),
      });

      const data = await insertRecipe("Salade");

      expect(supabase.from).toHaveBeenCalledWith("Recipe");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: { message: "insert failed", code: "42501" },
            }),
          }),
        }),
      });

      await expect(insertRecipe("Salade")).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("insertRecipeIngredient", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const rows = [
        { recipeId: 1, ingredientId: 3, quantity: 200 },
        { recipeId: 1, ingredientId: 5, quantity: 10 },
      ];
      const result = { data: [{ id: 1 }], error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: async () => result,
      });

      const data = await insertRecipeIngredient(rows);

      expect(supabase.from).toHaveBeenCalledWith("RecipeIngredient");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      const rows = [{ recipeId: 1, ingredientId: 3, quantity: 200 }];

      (supabase.from as jest.Mock).mockReturnValue({
        insert: async () => ({
          data: null,
          error: { message: "insert failed", code: "42501" },
        }),
      });

      await expect(insertRecipeIngredient(rows)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
