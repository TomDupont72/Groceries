import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAddIngredient } from "../useAddIngredient";
import { getZones, insertIngredient } from "../../services/AddIngredientService";

jest.mock("../../services/AddIngredientService", () => ({
  getZones: jest.fn(),
  insertIngredient: jest.fn(),
}));

describe("useAddIngredient", () => {
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

  it("charge les zones au démarrage", async () => {
    (getZones as jest.Mock).mockResolvedValue([
      { id: 1, name: "Fruits" },
      { id: 2, name: "Légumes" },
    ]);

    const { result } = renderHook(() => useAddIngredient());

    await waitFor(() => expect(getZones).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(result.current.zoneOptions).toEqual([
        { label: "Fruits", value: "1" },
        { label: "Légumes", value: "2" },
      ]),
    );

    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loadingPage).toBe(false);
  });

  it("refuse un ingrédient vide", async () => {
    (getZones as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAddIngredient());
    await waitFor(() => expect(getZones).toHaveBeenCalledTimes(1));

    let ok = true;

    await act(async () => {
      ok = await result.current.addIngredient("   ", "kg", 1);
    });

    expect(ok).toBe(false);
    expect(result.current.errorMsg).toBe("Le nom de l’ingrédient est vide.");
    expect(insertIngredient).not.toHaveBeenCalled();
  });

  it("refuse un ingrédient sans zone", async () => {
    (getZones as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAddIngredient());
    await waitFor(() => expect(getZones).toHaveBeenCalledTimes(1));

    let ok = true;

    await act(async () => {
      ok = await result.current.addIngredient("Tomate", "g");
    });

    expect(ok).toBe(false);
    expect(result.current.errorMsg).toBe("La zone est vide.");
    expect(insertIngredient).not.toHaveBeenCalled();
  });

  it("ajoute un ingrédient", async () => {
    (getZones as jest.Mock).mockResolvedValue([]);
    (insertIngredient as jest.Mock).mockResolvedValue({ id: 1, name: "Tomate" });

    const { result } = renderHook(() => useAddIngredient());
    await waitFor(() => expect(getZones).toHaveBeenCalledTimes(1));

    let ok = false;

    await act(async () => {
      ok = await result.current.addIngredient("  Tomate   ", "  g ", 1);
    });

    expect(ok).toBe(true);
    expect(result.current.errorMsg).toBeNull();
    expect(insertIngredient).toHaveBeenCalledTimes(1);
    expect(insertIngredient).toHaveBeenCalledWith("Tomate", "g", 1);
  });

  it("affiche une erreur si le chargement des zones échoue", async () => {
    (getZones as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useAddIngredient());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de charger la page.");
  });

  it("affiche une erreur si l'ajout échoue", async () => {
    (getZones as jest.Mock).mockResolvedValue([]);
    (insertIngredient as jest.Mock).mockRejectedValue(new Error("DB down"));

    const { result } = renderHook(() => useAddIngredient());
    await waitFor(() => expect(getZones).toHaveBeenCalledTimes(1));

    let ok = true;

    await act(async () => {
      ok = await result.current.addIngredient("Tomate", "g", 1);
    });

    expect(ok).toBe(false);
    expect(result.current.errorMsg).toBe("Impossible d’ajouter l’ingrédient.");
    expect(result.current.loadingAddIngredient).toBe(false);
  });
});
