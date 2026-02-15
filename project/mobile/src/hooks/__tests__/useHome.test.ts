import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useHomeScreen } from "../useHome";
import {
  getAppConfig,
  getCurrentUser,
  getUser,
  supabaseSignIn,
  supabaseSignUp,
  insertUser,
  supabaseGetSession,
  supabaseSignOut,
} from "../../services/HomeService";

jest.mock("../../services/HomeService", () => ({
  getAppConfig: jest.fn().mockResolvedValue([]),
  getCurrentUser: jest.fn(),
  getUser: jest.fn(),
  supabaseSignIn: jest.fn(),
  supabaseSignUp: jest.fn(),
  insertUser: jest.fn(),
  supabaseGetSession: jest.fn().mockResolvedValue(null),
  supabaseSignOut: jest.fn(),
}));

describe("useHomeScreen", () => {
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
    (getAppConfig as jest.Mock).mockResolvedValue([]);
    (supabaseGetSession as jest.Mock).mockResolvedValue(null);
  });

  it("charge appVersion et appLink au démarrage", async () => {
    (getAppConfig as jest.Mock).mockResolvedValue([
      { name: "version", value: "2.0.0" },
      { name: "link", value: "https://example.com" },
    ]);

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => expect(getAppConfig).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.appVersion).toBe("2.0.0");
    expect(result.current.appLink).toBe("https://example.com");
  });

  it("met loggedOut au démarrage si pas de session", async () => {
    (supabaseGetSession as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.authState).toBe("loggedOut");
  });

  it("met loggedIn au démarrage si session", async () => {
    (supabaseGetSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (getUser as jest.Mock).mockResolvedValue({ username: "Tom" });

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.authState).toBe("loggedIn");
    expect(result.current.username).toBe("Tom");
  });

  it("affiche une erreur si loadAll échoue", async () => {
    (getAppConfig as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de charger la page.");
  });

  it("affiche une erreur si loadUsername échoue au démarrage avec session", async () => {
    (supabaseGetSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (getCurrentUser as jest.Mock).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    expect(result.current.errorMsg).toBe("Impossible de récupérer l'utilisateur.");
  });

  it("login succès: reset credentials, loggedIn et loadUsername", async () => {
    (supabaseGetSession as jest.Mock).mockResolvedValue(null);
    (supabaseSignIn as jest.Mock).mockResolvedValue(null);
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (getUser as jest.Mock).mockResolvedValue({ username: "Tom" });

    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("pwd");
    });

    await act(async () => {
      await result.current.login();
    });

    expect(supabaseSignIn).toHaveBeenCalledWith("a@b.com", "pwd");
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.authState).toBe("loggedIn");
    expect(result.current.username).toBe("Tom");
  });

  it("login affiche une erreur si signIn échoue", async () => {
    (supabaseSignIn as jest.Mock).mockRejectedValue(new Error("bad creds"));

    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("pwd");
    });

    await act(async () => {
      await result.current.login();
    });

    expect(result.current.errorMsg).toBe("Impossible de récupérer l'utilisateur.");
    expect(result.current.loadingPage).toBe(false);
  });

  it("signUp refuse si mots de passe différents", async () => {
    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      result.current.setPassword("a");
      result.current.setPasswordConfirm("b");
    });

    await act(async () => {
      await result.current.signUp();
    });

    expect(result.current.errorMsg).toBe("Les mots de passe sont différents.");
    expect(supabaseSignUp).not.toHaveBeenCalled();
    expect(insertUser).not.toHaveBeenCalled();
  });

  it("signUp met loggedIn si session après inscription", async () => {
    (supabaseSignUp as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (insertUser as jest.Mock).mockResolvedValue(null);
    (supabaseGetSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "u1" });
    (getUser as jest.Mock).mockResolvedValue({ username: "Tom" });

    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("pwd");
      result.current.setPasswordConfirm("pwd");
      result.current.setUsername("Tom");
    });

    await act(async () => {
      await result.current.signUp();
    });

    expect(supabaseSignUp).toHaveBeenCalledWith("a@b.com", "pwd");
    expect(insertUser).toHaveBeenCalledWith("u1", "Tom");
    expect(result.current.authState).toBe("loggedIn");
    expect(result.current.username).toBe("Tom");
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.passwordConfirm).toBe("");
  });

  it("signUp met logIn si pas de session après inscription", async () => {
    (supabaseSignUp as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (insertUser as jest.Mock).mockResolvedValue(null);
    (supabaseGetSession as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("pwd");
      result.current.setPasswordConfirm("pwd");
      result.current.setUsername("Tom");
    });

    await act(async () => {
      await result.current.signUp();
    });

    expect(result.current.authState).toBe("logIn");
  });

  it("signUp affiche une erreur si l'inscription échoue", async () => {
    (supabaseSignUp as jest.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("pwd");
      result.current.setPasswordConfirm("pwd");
      result.current.setUsername("Tom");
    });

    await act(async () => {
      await result.current.signUp();
    });

    expect(result.current.errorMsg).toBe("L'inscription a échouée.");
  });

  it("logout succès: reset username et loggedOut", async () => {
    (supabaseSignOut as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      result.current.setAuthState("loggedIn");
      result.current.setUsername("Tom");
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(supabaseSignOut).toHaveBeenCalledTimes(1);
    expect(result.current.username).toBe("");
    expect(result.current.authState).toBe("loggedOut");
  });

  it("logout affiche une erreur si signOut échoue", async () => {
    (supabaseSignOut as jest.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.loadingPage).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.errorMsg).toBe("La déconnexion a échouée.");
  });
});
