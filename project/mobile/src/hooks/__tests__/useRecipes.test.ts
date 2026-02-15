import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useRecipes } from "../useRecipes";
import {
  getIngredients,
  getRecipes,
  insertRecipe,
  insertRecipeIngredient,
} from "../../services/RecipesService";

jest.mock("../../services/RecipesService", () => ({
  getIngredients: jest.fn().mockResolvedValue([]),
  getRecipes: jest.fn().mockResolvedValue([]),
  insertRecipe: jest.fn(),
  insertRecipeIngredient: jest.fn(),
}));

describe("useRecipes", () => {
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
    (getIngredients as jest.Mock).mockResolvedValue([]);
    (getRecipes as jest.Mock).mockResolvedValue([]);
  });

  it("ajoute un ingrédient s'il n'était pas sélectionné", () => {
    const { result } = renderHook(() => useRecipes());

    act(() => {
      result.current.toggleIngredient(3);
    });

    expect(result.current.selectedIngredients).toEqual({ 3: "" });
  });

  it("retire un ingrédient s'il est déjà sélectionné", () => {
    const { result } = renderHook(() => useRecipes());

    act(() => {
      result.current.toggleIngredient(3);
      result.current.toggleIngredient(3);
    });

    expect(result.current.selectedIngredients).toEqual({});
  });

  it("met à jour la quantité si l'id est sélectionné", () => {
    const { result } = renderHook(() => useRecipes());

    act(() => {
      result.current.toggleIngredient(3);
      result.current.setQuantity(3, "200");
    });

    expect(result.current.selectedIngredients).toEqual({ 3: "200" });
  });

  it("ne met pas à jour la quantité si l'id n'est pas sélectionné", () => {
    const { result } = renderHook(() => useRecipes());

    act(() => {
      result.current.toggleIngredient(5);
      result.current.setQuantity(3, "200");
    });

    expect(result.current.selectedIngredients).toEqual({ 5: "" });
  });

  it("charge ingrédients + recettes au démarrage", async () => {
    (getIngredients as jest.Mock).mockResolvedValue([{ id: 1, name: "Tomate", unit: "g" }]);
    (getRecipes as jest.Mock).mockResolvedValue([{ id: 10, name: "Salade" }]);

    const { result } = renderHook(() => useRecipes());

    await waitFor(() => expect(getIngredients).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getRecipes).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(result.current.ingredientData).toEqual([{ id: 1, name: "Tomate", unit: "g" }]),
    );
    await waitFor(() => expect(result.current.recipeData).toEqual([{ id: 10, name: "Salade" }]));

    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loadingPage).toBe(false);
  });

  it("affiche une erreur si le chargement échoue", async () => {
    (getIngredients as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useRecipes());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de charger la page.");
  });

  it("submit refuse si nom de recette vide", async () => {
    const { result } = renderHook(() => useRecipes());
    await waitFor(() => expect(getIngredients).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.submit("   ");
    });

    expect(result.current.errorMsg).toBe("Le nom de la recette est vide.");
    expect(insertRecipe).not.toHaveBeenCalled();
    expect(insertRecipeIngredient).not.toHaveBeenCalled();
  });

  it("submit refuse si aucun ingrédient sélectionné", async () => {
    const { result } = renderHook(() => useRecipes());
    await waitFor(() => expect(getIngredients).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.submit("Salade");
    });

    expect(result.current.errorMsg).toBe("Un ingrédient au moins doit être sélectionné.");
    expect(insertRecipe).not.toHaveBeenCalled();
    expect(insertRecipeIngredient).not.toHaveBeenCalled();
  });

  it("submit refuse si une quantité est vide", async () => {
    const { result } = renderHook(() => useRecipes());
    await waitFor(() => expect(getIngredients).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.toggleIngredient(3);
    });

    await act(async () => {
      await result.current.submit("Salade");
    });

    expect(result.current.errorMsg).toBe("Tous les ingrédients doivent avoir une quantité.");
    expect(insertRecipe).not.toHaveBeenCalled();
    expect(insertRecipeIngredient).not.toHaveBeenCalled();
  });

  it("submit succès: insère recette, insère ingrédients, refresh et reset sélection", async () => {
    (insertRecipe as jest.Mock).mockResolvedValue({ id: 99, name: "Salade" });
    (insertRecipeIngredient as jest.Mock).mockResolvedValue(null);
    (getIngredients as jest.Mock).mockResolvedValue([]);
    (getRecipes as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useRecipes());
    await waitFor(() => expect(getIngredients).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.toggleIngredient(3);
      result.current.toggleIngredient(5);
      result.current.setQuantity(3, "200");
      result.current.setQuantity(5, "10");
    });

    await act(async () => {
      await result.current.submit("  Salade  ");
    });

    expect(insertRecipe).toHaveBeenCalledWith("Salade");
    expect(insertRecipeIngredient).toHaveBeenCalledTimes(1);
    expect(insertRecipeIngredient).toHaveBeenCalledWith([
      { recipeId: 99, ingredientId: 3, quantity: 200 },
      { recipeId: 99, ingredientId: 5, quantity: 10 },
    ]);

    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loadingAddRecipe).toBe(false);
    expect(result.current.selectedIngredients).toEqual({});
  });

  it("submit affiche une erreur si insertRecipe échoue", async () => {
    (insertRecipe as jest.Mock).mockRejectedValue(new Error("db down"));

    const { result } = renderHook(() => useRecipes());
    await waitFor(() => expect(getIngredients).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.toggleIngredient(3);
      result.current.setQuantity(3, "200");
    });

    await act(async () => {
      await result.current.submit("Salade");
    });

    expect(result.current.errorMsg).toBe("Impossible d'ajouter la recette.");
    expect(result.current.loadingAddRecipe).toBe(false);
  });
});
