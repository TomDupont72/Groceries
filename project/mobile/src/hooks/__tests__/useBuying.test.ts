import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useBuying } from "../useBuying";
import {
  getGrocery,
  insertGrocery,
  upsertGroceryIngredient,
  getBuyItems,
} from "../../services/BuyingService";

jest.mock("../../services/BuyingService", () => ({
  getGrocery: jest.fn().mockResolvedValue({ id: 1 }),
  insertGrocery: jest.fn(),
  upsertGroceryIngredient: jest.fn(),
  getBuyItems: jest.fn().mockResolvedValue([]),
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
    (getGrocery as jest.Mock).mockResolvedValue({ id: 1 });
    (getBuyItems as jest.Mock).mockResolvedValue([]);
  });

  it("groupedBuyItemsData crée un groupe quand la zone n'existe pas encore", async () => {
    (getGrocery as jest.Mock).mockResolvedValue({ id: 7 });
    (getBuyItems as jest.Mock).mockResolvedValue([
      {
        ingredientId: 3,
        ingredientName: "Tomate",
        unit: "g",
        quantity: 200,
        checked: false,
        zoneId: 1,
        zoneName: "Légumes",
      },
      {
        ingredientId: 4,
        ingredientName: "Courgette",
        unit: "g",
        quantity: 150,
        checked: false,
        zoneId: 1,
        zoneName: "Légumes",
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
            ingredientName: "Tomate",
            unit: "g",
            quantity: 200,
            checked: false,
            zoneId: 1,
            zoneName: "Légumes",
          },
          {
            ingredientId: 4,
            ingredientName: "Courgette",
            unit: "g",
            quantity: 150,
            checked: false,
            zoneId: 1,
            zoneName: "Légumes",
          },
        ],
      },
    });
  });

  it("charge les buy items au démarrage", async () => {
    (getGrocery as jest.Mock).mockResolvedValue({ id: 7 });
    (getBuyItems as jest.Mock).mockResolvedValue([
      {
        ingredientId: 3,
        ingredientName: "Tomate",
        unit: "g",
        quantity: 200,
        checked: false,
        zoneId: 1,
        zoneName: "Légumes",
      },
      {
        ingredientId: 5,
        ingredientName: "Sel",
        unit: "g",
        quantity: 10,
        checked: true,
        zoneId: 2,
        zoneName: "Épices",
      },
    ]);

    const { result } = renderHook(() => useBuying());

    await waitFor(() => expect(getGrocery).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getBuyItems).toHaveBeenCalledTimes(1));
    expect(getBuyItems).toHaveBeenCalledWith(7);

    await waitFor(() =>
      expect(result.current.groupedBuyItemsData).toEqual({
        1: {
          zoneName: "Légumes",
          buyItem: [
            {
              ingredientId: 3,
              ingredientName: "Tomate",
              unit: "g",
              quantity: 200,
              checked: false,
              zoneId: 1,
              zoneName: "Légumes",
            },
          ],
        },
        2: {
          zoneName: "Épices",
          buyItem: [
            {
              ingredientId: 5,
              ingredientName: "Sel",
              unit: "g",
              quantity: 10,
              checked: true,
              zoneId: 2,
              zoneName: "Épices",
            },
          ],
        },
      }),
    );

    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loadingPage).toBe(false);
  });

  it("insère une grocery si aucune n'existe", async () => {
    (getGrocery as jest.Mock).mockResolvedValue({ id: null });
    (insertGrocery as jest.Mock).mockResolvedValue({ id: 22 });
    (getBuyItems as jest.Mock).mockResolvedValue([]);

    renderHook(() => useBuying());

    await waitFor(() => expect(getGrocery).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(insertGrocery).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getBuyItems).toHaveBeenCalledWith(22));
  });

  it("affiche une erreur si la récupération/creation des courses échoue", async () => {
    (getGrocery as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useBuying());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de récupérer les courses.");
  });

  it("affiche une erreur si le chargement échoue", async () => {
    (getBuyItems as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useBuying());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de charger la page.");
  });

  it("toggleCheck met à jour localement l'item ciblé", async () => {
    (getGrocery as jest.Mock).mockResolvedValue({ id: 7 });
    (getBuyItems as jest.Mock)
      .mockResolvedValueOnce([
        {
          ingredientId: 3,
          ingredientName: "Tomate",
          unit: "g",
          quantity: 200,
          checked: false,
          zoneId: 1,
          zoneName: "Légumes",
        },
        {
          ingredientId: 5,
          ingredientName: "Sel",
          unit: "g",
          quantity: 10,
          checked: true,
          zoneId: 2,
          zoneName: "Épices",
        },
      ])
      .mockResolvedValueOnce([
        {
          ingredientId: 3,
          ingredientName: "Tomate",
          unit: "g",
          quantity: 200,
          checked: true,
          zoneId: 1,
          zoneName: "Légumes",
        },
        {
          ingredientId: 5,
          ingredientName: "Sel",
          unit: "g",
          quantity: 10,
          checked: true,
          zoneId: 2,
          zoneName: "Épices",
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
    (getGrocery as jest.Mock).mockResolvedValue({ id: 7 });
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
    (getGrocery as jest.Mock).mockResolvedValue({ id: 7 });
    (getBuyItems as jest.Mock)
      .mockResolvedValueOnce([
        {
          ingredientId: 3,
          ingredientName: "Tomate",
          unit: "g",
          quantity: 200,
          checked: false,
          zoneId: 1,
          zoneName: "Légumes",
        },
      ])
      .mockResolvedValueOnce([
        {
          ingredientId: 3,
          ingredientName: "Tomate",
          unit: "g",
          quantity: 200,
          checked: true,
          zoneId: 1,
          zoneName: "Légumes",
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
    (getGrocery as jest.Mock).mockResolvedValue({ id: 7 });
    (getBuyItems as jest.Mock).mockResolvedValue([
      {
        ingredientId: 3,
        ingredientName: "Tomate",
        unit: "g",
        quantity: 200,
        checked: false,
        zoneId: 1,
        zoneName: "Légumes",
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
