import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useGroceries } from "../useGroceries";
import { getRecipes, getGroceryRecipe, insertGroceryRecipe } from "../../services/GroceriesService";
import { getOrCreateGroceryId } from "../../usecases/GroceriesUsecase";

jest.mock("../../services/GroceriesService", () => ({
  getRecipes: jest.fn().mockResolvedValue([]),
  getGroceryRecipe: jest.fn().mockResolvedValue([]),
  insertGroceryRecipe: jest.fn(),
}));

jest.mock("../../usecases/GroceriesUsecase", () => ({
  getOrCreateGroceryId: jest.fn().mockResolvedValue(1),
}));

describe("useGroceries", () => {
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
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(1);
    (getRecipes as jest.Mock).mockResolvedValue([]);
    (getGroceryRecipe as jest.Mock).mockResolvedValue([]);
  });

  it("ajoute une recette si elle n'était pas sélectionnée", () => {
    const { result } = renderHook(() => useGroceries());

    act(() => {
      result.current.toggleRecipe(3);
    });

    expect(result.current.selectedRecipes).toEqual({ 3: "" });
  });

  it("retire une recette si elle est déjà sélectionnée", () => {
    const { result } = renderHook(() => useGroceries());

    act(() => {
      result.current.toggleRecipe(3);
      result.current.toggleRecipe(3);
    });

    expect(result.current.selectedRecipes).toEqual({});
  });

  it("met à jour la quantité si l'id est sélectionné", () => {
    const { result } = renderHook(() => useGroceries());

    act(() => {
      result.current.toggleRecipe(3);
      result.current.setQuantity(3, "2");
    });

    expect(result.current.selectedRecipes).toEqual({ 3: "2" });
  });

  it("ne met pas à jour la quantité si l'id n'est pas sélectionné", () => {
    const { result } = renderHook(() => useGroceries());

    act(() => {
      result.current.toggleRecipe(5);
      result.current.setQuantity(3, "2");
    });

    expect(result.current.selectedRecipes).toEqual({ 5: "" });
  });

  it("charge recettes + lignes de courses au démarrage", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (getRecipes as jest.Mock).mockResolvedValue([
      { id: 10, name: "Salade", createdAt: "2025-01-01T00:00:00.000Z" },
    ]);
    (getGroceryRecipe as jest.Mock).mockResolvedValue([
      { id: 1, groceryId: 7, recipeId: 10, recipeName: "Salade", quantity: 2 },
    ]);

    const { result } = renderHook(() => useGroceries());

    await waitFor(() => expect(getOrCreateGroceryId).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getRecipes).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getGroceryRecipe).toHaveBeenCalledTimes(1));

    expect(getGroceryRecipe).toHaveBeenCalledWith(7);
    expect(result.current.recipeData).toEqual([
      { id: 10, name: "Salade", createdAt: "2025-01-01T00:00:00.000Z" },
    ]);
    expect(result.current.groceryRecipeData).toEqual([
      { id: 1, groceryId: 7, recipeId: 10, recipeName: "Salade", quantity: 2 },
    ]);
    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loadingPage).toBe(false);
  });

  it("ne charge pas les données si getOrCreateGroceryId retourne null", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useGroceries());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(getRecipes).not.toHaveBeenCalled();
    expect(getGroceryRecipe).not.toHaveBeenCalled();
    expect(result.current.errorMsg).toBeNull();
  });

  it("affiche une erreur si le chargement de la page échoue", async () => {
    (getRecipes as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useGroceries());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de charger la page.");
  });

  it("submit refuse si aucune recette sélectionnée", async () => {
    const { result } = renderHook(() => useGroceries());
    await waitFor(() => expect(getOrCreateGroceryId).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.errorMsg).toBe("Une recette au moins doit être sélectionnée.");
    expect(insertGroceryRecipe).not.toHaveBeenCalled();
  });

  it("submit refuse si une quantité est vide", async () => {
    const { result } = renderHook(() => useGroceries());
    await waitFor(() => expect(getOrCreateGroceryId).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.toggleRecipe(3);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.errorMsg).toBe("Toutes les recettes doivent avoir une quantité.");
    expect(insertGroceryRecipe).not.toHaveBeenCalled();
  });

  it("submit succès: insère groceryRecipe, refresh et reset sélection", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (insertGroceryRecipe as jest.Mock).mockResolvedValue(null);
    (getRecipes as jest.Mock).mockResolvedValue([]);
    (getGroceryRecipe as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useGroceries());
    await waitFor(() => expect(getOrCreateGroceryId).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.toggleRecipe(3);
      result.current.toggleRecipe(5);
      result.current.setQuantity(3, "2");
      result.current.setQuantity(5, "10");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(insertGroceryRecipe).toHaveBeenCalledTimes(1);
    expect(insertGroceryRecipe).toHaveBeenCalledWith([
      { groceryId: 7, recipeId: 3, quantity: 2 },
      { groceryId: 7, recipeId: 5, quantity: 10 },
    ]);

    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loadingAddGrocery).toBe(false);
    expect(result.current.selectedRecipes).toEqual([]);
  });

  it("submit affiche une erreur si l'ajout échoue", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (insertGroceryRecipe as jest.Mock).mockRejectedValue(new Error("db down"));

    const { result } = renderHook(() => useGroceries());
    await waitFor(() => expect(getOrCreateGroceryId).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.toggleRecipe(3);
      result.current.setQuantity(3, "2");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.errorMsg).toBe("Impossible d'ajouter les courses.");
    expect(result.current.loadingAddGrocery).toBe(false);
  });
});
