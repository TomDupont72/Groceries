import {
  getGrocery,
  insertGrocery,
  getRecipes,
  getGroceryRecipe,
  insertGroceryRecipe,
  ApiError,
} from "../GroceriesService";
import { supabase } from "../../api/supabase";

jest.mock("../../api/supabase", () => ({
  supabase: { from: jest.fn() },
}));

describe("GroceriesService", () => {
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

  describe("getGrocery", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: { id: 1 }, error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          single: async () => result,
        }),
      });

      const data = await getGrocery();

      expect(supabase.from).toHaveBeenCalledWith("Grocery");
      expect(data).toEqual({ id: 1 });
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          single: async () => ({
            data: null,
            error: { message: "select failed", code: "42501" },
          }),
        }),
      });

      await expect(getGrocery()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("insertGrocery", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: { id: 22 }, error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: async () => result,
          }),
        }),
      });

      const data = await insertGrocery();

      expect(supabase.from).toHaveBeenCalledWith("Grocery");
      expect(data).toEqual({ id: 22 });
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

      await expect(insertGrocery()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("getRecipes", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: [{ id: 1, name: "Salade" }], error: null };

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

  describe("getGroceryRecipe", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = {
        data: [
          {
            id: 1,
            groceryId: 7,
            recipeId: 10,
            quantity: 2,
            recipe: { name: "Salade" },
          },
        ],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: async () => result,
        }),
      });

      const data = await getGroceryRecipe(7);

      expect(supabase.from).toHaveBeenCalledWith("GroceryRecipe");
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

      await expect(getGroceryRecipe(7)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("insertGroceryRecipe", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const rows = [
        { groceryId: 7, recipeId: 3, quantity: 2 },
        { groceryId: 7, recipeId: 5, quantity: 10 },
      ];
      const result = { data: [{ id: 1 }], error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: async () => result,
      });

      const data = await insertGroceryRecipe(rows);

      expect(supabase.from).toHaveBeenCalledWith("GroceryRecipe");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      const rows = [{ groceryId: 7, recipeId: 3, quantity: 2 }];

      (supabase.from as jest.Mock).mockReturnValue({
        insert: async () => ({
          data: null,
          error: { message: "insert failed", code: "42501" },
        }),
      });

      await expect(insertGroceryRecipe(rows)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
