import { useEffect, useState, useCallback } from "react";
import { getAppConfig, getCurrentUser, getUser, supabaseSignIn, supabaseSignUp, insertUser, supabaseGetSession, supabaseSignOut } from "../services/HomeScreenService";

type AuthState = "loggedOut" | "logIn" | "signUp" | "loggedIn";

export function useHomeScreen() {
    const [loadingPage, setLoadingPage] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>("");
    const [appVersion, setAppVersion] = useState("");
    const [appLink, setAppLink] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [authState, setAuthState] = useState<AuthState>("loggedOut");
    const version = "1.4.0";

    const loadAll = useCallback(async () => {
        setErrorMsg(null);

        try {
            const dataAppConfig = await getAppConfig();

            setAppVersion(dataAppConfig.find((row) => row.name === "version")?.value);
            setAppLink(dataAppConfig.find((row) => row.name === "link")?.value);
        } catch (error) {
            console.error("[useHomeScreen.loadAll] failed", error);
            setErrorMsg("Impossible de charger la page.");
        }
    }, []);

    const loadUsername = useCallback(async () => {
        setErrorMsg(null);

        try {
            const dataCurrentUser = await getCurrentUser();

            const dataUser = await getUser(dataCurrentUser.id);

            setUsername(dataUser.username);
        } catch (error) {
            console.error("[useHomeScreen.loadUsername] failed", error);
            setErrorMsg("Impossible de récupérer l'utilisateur.");
        }
    }, []);

    const login = async () => {
        setLoadingPage(true);
        setErrorMsg(null);

        try {
            await supabaseSignIn(email, password);

            setEmail("");
            setPassword("");
            setAuthState("loggedIn");

            await loadUsername();
        } catch (error) {
            console.error("[useHomeScreen.login] failed", error);
            setErrorMsg("Impossible de récupérer l'utilisateur.");
        } finally {
            setLoadingPage(false);
        }
    };

    const signUp = async () => {
        if (password !== passwordConfirm) {
            setErrorMsg("Les mots de passe sont différents.");
            return;
        }

        setErrorMsg(null);

        try {
            const dataSignUp = await supabaseSignUp(email, password);

            const userId = dataSignUp.user?.id

            await insertUser(userId, username);

            setPassword("");
            setPasswordConfirm("");
            setEmail("");

            const session = await supabaseGetSession();

            if (session) {
                setAuthState("loggedIn");
                await loadUsername();
            } else {
            /* Faire quelque chose ici pour verification par mails */
            setAuthState("logIn");
            }
        } catch (error) {
            console.error("[useHomeScreen.signUp] failed", error);
            setErrorMsg("L'inscription a échouée.");
        }
    };

    const logout = async () => {
        setErrorMsg(null);

        try {
            await supabaseSignOut();
            setUsername("");
            setAuthState("loggedOut");
        } catch (error) {
            console.error("[useHomeScreen.signOut] failed", error);
            setErrorMsg("La déconnexion a échouée.");
        }
    };

    useEffect(() => {
        (async () => {
            setLoadingPage(true);

            await loadAll();

            const session = await supabaseGetSession();

            if (session) {
            setAuthState("loggedIn");
            await loadUsername();
            } else {
            setAuthState("loggedOut");
            }

            setLoadingPage(false);
        })();
    }, [loadAll, loadUsername]);

    return {
        loadingPage,
        errorMsg,
        authState,
        appVersion,
        version,
        appLink,
        username,
        email,
        password,
        passwordConfirm,
        logout,
        setEmail,
        setPassword,
        login,
        setAuthState,
        setUsername,
        setPasswordConfirm,
        signUp
    }
}