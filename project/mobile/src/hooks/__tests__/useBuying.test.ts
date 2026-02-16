import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useBuying } from "../useBuying";
import { upsertGroceryIngredient, getBuyItems } from "../../services/BuyingService";
import { getOrCreateGroceryId } from "../../usecases/GroceriesUsecase";

jest.mock("../../services/BuyingService", () => ({
  upsertGroceryIngredient: jest.fn(),
  getBuyItems: jest.fn().mockResolvedValue([]),
}));

jest.mock("../../usecases/GroceriesUsecase", () => ({
  getOrCreateGroceryId: jest.fn().mockResolvedValue(1),
}));

describe("useBuying", () => {
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
    (getBuyItems as jest.Mock).mockResolvedValue([]);
  });

  it("groupedBuyItemsData crée un groupe quand la zone n'existe pas encore", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (getBuyItems as jest.Mock).mockResolvedValue([
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
      {
        ingredientId: 4,
        name: "Courgette",
        unit: "g",
        zoneName: "Légumes",
        zoneId: 1,
        total: 150,
        checked: false,
        groceryIngredientId: null,
      },
    ]);

    const { result } = renderHook(() => useBuying());

    await waitFor(() => expect(getBuyItems).toHaveBeenCalledTimes(1));

    expect(result.current.groupedBuyItemsData).toEqual({
      1: {
        zoneName: "Légumes",
        buyItem: [
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
          {
            ingredientId: 4,
            name: "Courgette",
            unit: "g",
            zoneName: "Légumes",
            zoneId: 1,
            total: 150,
            checked: false,
            groceryIngredientId: null,
          },
        ],
      },
    });
  });

  it("charge les buy items au démarrage", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (getBuyItems as jest.Mock).mockResolvedValue([
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
      {
        ingredientId: 5,
        name: "Sel",
        unit: "g",
        zoneName: "Épices",
        zoneId: 2,
        total: 10,
        checked: true,
        groceryIngredientId: 9,
      },
    ]);

    const { result } = renderHook(() => useBuying());

    await waitFor(() => expect(getOrCreateGroceryId).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getBuyItems).toHaveBeenCalledTimes(1));
    expect(getBuyItems).toHaveBeenCalledWith(7);

    await waitFor(() =>
      expect(result.current.groupedBuyItemsData).toEqual({
        1: {
          zoneName: "Légumes",
          buyItem: [
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
        },
        2: {
          zoneName: "Épices",
          buyItem: [
            {
              ingredientId: 5,
              name: "Sel",
              unit: "g",
              zoneName: "Épices",
              zoneId: 2,
              total: 10,
              checked: true,
              groceryIngredientId: 9,
            },
          ],
        },
      }),
    );

    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loadingPage).toBe(false);
  });

  it("affiche une erreur si le chargement échoue", async () => {
    (getBuyItems as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useBuying());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de charger la page.");
  });

  it("affiche une erreur si getOrCreateGroceryId échoue", async () => {
    (getOrCreateGroceryId as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useBuying());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de charger la page.");
  });

  it("toggleCheck met à jour localement l'item ciblé", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (getBuyItems as jest.Mock)
      .mockResolvedValueOnce([
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
        {
          ingredientId: 5,
          name: "Sel",
          unit: "g",
          zoneName: "Épices",
          zoneId: 2,
          total: 10,
          checked: true,
          groceryIngredientId: 9,
        },
      ])
      .mockResolvedValueOnce([
        {
          ingredientId: 3,
          name: "Tomate",
          unit: "g",
          zoneName: "Légumes",
          zoneId: 1,
          total: 200,
          checked: true,
          groceryIngredientId: null,
        },
        {
          ingredientId: 5,
          name: "Sel",
          unit: "g",
          zoneName: "Épices",
          zoneId: 2,
          total: 10,
          checked: true,
          groceryIngredientId: 9,
        },
      ]);
    (upsertGroceryIngredient as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useBuying());
    await waitFor(() => expect(getBuyItems).toHaveBeenCalledTimes(1));

    let p: Promise<void>;
    await act(async () => {
      p = result.current.toggleCheck(3);
    });

    await waitFor(() =>
      expect(result.current.groupedBuyItemsData[1].buyItem[0].checked).toBe(true),
    );
    expect(result.current.groupedBuyItemsData[2].buyItem[0].checked).toBe(true);

    await act(async () => {
      await p;
    });
  });

  it("toggleCheck upsert avec checked=false si l'ingrédient n'existe pas dans buyItemsData", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (getBuyItems as jest.Mock).mockResolvedValue([]);
    (upsertGroceryIngredient as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useBuying());
    await waitFor(() => expect(getBuyItems).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.toggleCheck(999);
    });

    expect(upsertGroceryIngredient).toHaveBeenCalledTimes(1);
    expect(upsertGroceryIngredient).toHaveBeenCalledWith(999, false);
  });

  it("toggleCheck met à jour checked et upsert puis refresh", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (getBuyItems as jest.Mock)
      .mockResolvedValueOnce([
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
      ])
      .mockResolvedValueOnce([
        {
          ingredientId: 3,
          name: "Tomate",
          unit: "g",
          zoneName: "Légumes",
          zoneId: 1,
          total: 200,
          checked: true,
          groceryIngredientId: null,
        },
      ]);
    (upsertGroceryIngredient as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useBuying());
    await waitFor(() => expect(getBuyItems).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.toggleCheck(3);
    });

    expect(upsertGroceryIngredient).toHaveBeenCalledTimes(1);
    expect(upsertGroceryIngredient).toHaveBeenCalledWith(3, true);
    expect(getBuyItems).toHaveBeenCalledTimes(2);
    expect(result.current.errorMsg).toBeNull();
  });

  it("toggleCheck affiche une erreur si l'update échoue", async () => {
    (getOrCreateGroceryId as jest.Mock).mockResolvedValue(7);
    (getBuyItems as jest.Mock).mockResolvedValue([
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
    ]);
    (upsertGroceryIngredient as jest.Mock).mockRejectedValue(new Error("db down"));

    const { result } = renderHook(() => useBuying());
    await waitFor(() => expect(getBuyItems).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.toggleCheck(3);
    });

    expect(result.current.errorMsg).toBe("Impossible de modifier le statut de l'ingrédient.");
  });
});
