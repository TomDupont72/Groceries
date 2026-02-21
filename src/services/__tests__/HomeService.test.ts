import {
  getAppConfig,
  getCurrentUser,
  getUser,
  supabaseSignIn,
  supabaseSignUp,
  insertUser,
  supabaseGetSession,
  supabaseSignOut,
} from "../HomeService";
import { ApiError } from "../ApiError";
import { supabase } from "../../api/supabase";

jest.mock("../../api/supabase", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

describe("HomeService", () => {
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

  describe("getAppConfig", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: [{ name: "version", value: "1.0.0" }], error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        select: async () => result,
      });

      const data = await getAppConfig();

      expect(supabase.from).toHaveBeenCalledWith("AppConfig");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: async () => ({
          data: null,
          error: { message: "select failed", code: "42501" },
        }),
      });

      await expect(getAppConfig()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("getCurrentUser", () => {
    it("retourne user quand Supabase répond OK", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "u1" } },
        error: null,
      });

      const user = await getCurrentUser();

      expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
      expect(user).toEqual({ id: "u1" });
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: "getUser failed", code: "42501" },
      });

      await expect(getCurrentUser()).rejects.toBeInstanceOf(ApiError);
    });

    it("throw ApiError si userId absent", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: {} },
        error: null,
      });

      await expect(getCurrentUser()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("getUser", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: { username: "Tom", userId: "u1" }, error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: async () => result,
          }),
        }),
      });

      const data = await getUser("u1");

      expect(supabase.from).toHaveBeenCalledWith("User");
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: { message: "select failed", code: "42501" },
            }),
          }),
        }),
      });

      await expect(getUser("u1")).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("supabaseSignIn", () => {
    it("trim l'email et retourne la data quand Supabase répond OK", async () => {
      const result = { data: { session: {} }, error: null };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(result);

      const data = await supabaseSignIn("  a@b.com  ", "pwd");

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "pwd",
      });
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "signIn failed", code: "42501" },
      });

      await expect(supabaseSignIn("a@b.com", "pwd")).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("supabaseSignUp", () => {
    it("trim l'email et retourne la data quand Supabase répond OK", async () => {
      const result = { data: { user: { id: "u1" } }, error: null };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue(result);

      const data = await supabaseSignUp("  a@b.com  ", "pwd");

      expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: "a@b.com", password: "pwd" });
      expect(data).toEqual(result.data);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "signUp failed", code: "42501" },
      });

      await expect(supabaseSignUp("a@b.com", "pwd")).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("insertUser", () => {
    it("retourne la data quand Supabase répond OK", async () => {
      const result = { data: { userId: "u1", username: "Tom" }, error: null };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: async () => result,
          }),
        }),
      });

      const data = await insertUser("u1", "Tom");

      expect(supabase.from).toHaveBeenCalledWith("User");
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

      await expect(insertUser("u1", "Tom")).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("supabaseGetSession", () => {
    it("retourne la session quand Supabase répond OK", async () => {
      const result = { data: { session: { user: { id: "u1" } } }, error: null };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue(result);

      const session = await supabaseGetSession();

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(session).toEqual(result.data.session);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: "getSession failed", code: "42501" },
      });

      await expect(supabaseGetSession()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("supabaseSignOut", () => {
    it("ne throw pas quand Supabase répond OK", async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      await expect(supabaseSignOut()).resolves.toBeUndefined();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("throw ApiError quand Supabase renvoie une erreur", async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: "signOut failed", code: "42501" },
      });

      await expect(supabaseSignOut()).rejects.toBeInstanceOf(ApiError);
    });
  });
});
