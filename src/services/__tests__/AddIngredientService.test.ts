import { insertIngredient, getZones } from "../AddIngredientService";
import { ApiError } from "../ApiError";
import { supabase } from "../../api/supabase";

jest.mock("../../api/supabase", () => ({
  supabase: { from: jest.fn() },
}));

describe("AddIngredientService", () => {
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

  describe("insertIngredient", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: { id: 1, name: "Tomate" }, error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: async () => result,
          }),
        }),
      });

      const data = await insertIngredient("Tomate", "g", 1);

      expect(supabase.from).toHaveBeenCalledWith("Ingredient");
      expect(data).toEqual({ id: 1, name: "Tomate" });
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

      await expect(insertIngredient("Tomate", "g", 1)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("getZones", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: [{ id: 1, name: "Fruits" }], error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: async () => result,
        }),
      });

      const data = await getZones();

      expect(supabase.from).toHaveBeenCalledWith("Zone");
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

      await expect(getZones()).rejects.toBeInstanceOf(ApiError);
    });

    it("retourne [] si data est null", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: async () => ({ data: null, error: null }),
        }),
      });

      const data = await getZones();

      expect(data).toEqual([]);
    });
  });
});
