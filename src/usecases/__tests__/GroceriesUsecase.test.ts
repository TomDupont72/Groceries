import { getOrCreateGroceryId } from "../GroceriesUsecase";
import { getGrocery, insertGrocery } from "../../services/GroceriesService";

jest.mock("../../services/GroceriesService", () => ({
  getGrocery: jest.fn(),
  insertGrocery: jest.fn(),
}));

describe("getOrCreateGroceryId", () => {
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

  it("retourne l'id si une grocery existe déjà", async () => {
    (getGrocery as jest.Mock).mockResolvedValue({ id: 7 });

    const id = await getOrCreateGroceryId();

    expect(getGrocery).toHaveBeenCalledTimes(1);
    expect(insertGrocery).not.toHaveBeenCalled();
    expect(id).toBe(7);
  });

  it("insère une grocery si aucune n'existe et retourne l'id", async () => {
    (getGrocery as jest.Mock).mockResolvedValue({ id: null });
    (insertGrocery as jest.Mock).mockResolvedValue({ id: 22 });

    const id = await getOrCreateGroceryId();

    expect(getGrocery).toHaveBeenCalledTimes(1);
    expect(insertGrocery).toHaveBeenCalledTimes(1);
    expect(id).toBe(22);
  });

  it("retourne undefined si une erreur survient", async () => {
    (getGrocery as jest.Mock).mockRejectedValue(new Error("network"));

    const id = await getOrCreateGroceryId();

    expect(getGrocery).toHaveBeenCalledTimes(1);
    expect(id).toBeUndefined();
  });
});
