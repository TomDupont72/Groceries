import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { tokens } from "../theme/tokens";
import { Card, RetroButton, RetroInput } from "../theme/components";
import { supabase } from "../api/supabase";
import { Screen } from "../theme/Screen";
import * as Linking from "expo-linking";

type AuthState = "loggedOut" | "logIn" | "signUp" | "loggedIn";

export default function HomeScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [authState, setAuthState] = useState<AuthState>("loggedOut");
  const [username, setUsername] = useState("");
  const version = "1.3.0";
  const [appVersion, setAppVersion] = useState("");
  const [appLink, setAppLink] = useState("");

  const loadAll = async () => {
    try {
      const { data: appData, error: appError } = await supabase
        .from("AppConfig")
        .select("name, value");

      if (appError) throw appError;

      const rows = appData ?? [];
      setAppVersion(rows.find((row) => row.name === "version")?.value ?? "");
      setAppLink(rows.find((row) => row.name === "link")?.value ?? "");
    } catch (e: any) {
      console.log("APP CONFIG ERROR", e);
    }
  };

  const loadUsername = async () => {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) throw userErr;
    if (!user?.id) throw new Error("Utilisateur non connecté");

    const { data, error } = await supabase
      .from("User")
      .select("username,userId")
      .eq("userId", user.id)
      .maybeSingle();

    if (error) throw error;

    const pickedUsername = data?.username ?? "";
    setUsername(pickedUsername);
  };

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Login error", error.message);
        return;
      }

      setEmail("");
      setPassword("");
      setAuthState("loggedIn");

      await loadUsername();
    } catch (e: any) {
      console.log("LOGIN ERROR", e);
      Alert.alert("Erreur", e?.message || "Login échoué");
    }
  };

  const signUp = async () => {
    try {
      if (password !== passwordConfirm) {
        Alert.alert("Les mots de passe sont différents.");
        return;
      }

      console.log(email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error("No user returned by signUp");

      const { error: profileError } = await supabase
        .from("User")
        .insert({ userId, username })
        .select("username,userId")
        .single();

      if (profileError) throw profileError;

      setPassword("");
      setPasswordConfirm("");
      setEmail("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setAuthState("loggedIn");
        await loadUsername();
      } else {
        Alert.alert(
          "Inscription réussie",
          "Vérifie tes emails si une confirmation est requise, puis connecte-toi.",
        );
        setAuthState("logIn");
      }
    } catch (e: any) {
      console.log("SIGNUP ERROR", e);
      Alert.alert("Erreur", e?.message || "Inscription échouée");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsername("");
    setAuthState("loggedOut");
  };

  useEffect(() => {
    loadAll();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthState("loggedIn");
        loadUsername().catch((e) => console.log("LOAD USERNAME ERROR", e));
      } else {
        setAuthState("loggedOut");
      }
    });
  }, []);

  return (
    <Screen style={{ paddingTop: tokens.spacing.xl * 2 }}>
      {authState === "loggedIn" && (
        <View style={{ flex: 1 }}>
          <View>
            <Text style={styles.h1}>Bonjour {username || "👋"}</Text>

            <Card style={{ gap: tokens.spacing.sm }}>
              <RetroButton
                title="Ajouter un ingredient"
                onPress={() => navigation.navigate("AddIngredient")}
              />

              <RetroButton
                title="Gérer les recettes"
                onPress={() => navigation.navigate("Recipes")}
              />

              <RetroButton
                title="Gérer les courses"
                onPress={() => navigation.navigate("Groceries")}
              />

              <RetroButton
                title="Faire les courses"
                onPress={() => navigation.navigate("Buying")}
              />

              <RetroButton title="Se déconnecter" onPress={logout} />
            </Card>

            {appVersion !== "" && appVersion !== version && (
              <Text style={[styles.h2, styles.centered]}>
                Vous êtes sur une ancienne version,{" "}
                <Text style={styles.link} onPress={() => appLink && Linking.openURL(appLink)}>
                  cliquez ici
                </Text>{" "}
                pour mettre à jour.
              </Text>
            )}
          </View>

          <Text style={styles.version}>v{version}</Text>
        </View>
      )}

      {authState === "logIn" && (
        <View style={{ paddingTop: tokens.spacing.xl }}>
          <Text style={styles.h1}>Connexion</Text>
          <Card style={{ gap: tokens.spacing.sm }}>
            <RetroInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <RetroInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
            />

            <RetroButton title="Se connecter" onPress={login} />
          </Card>

          <Text style={[styles.h2, styles.centered]}>
            Pas de compte ?{" "}
            <Text style={styles.link} onPress={() => setAuthState("signUp")}>
              S&apos;inscrire
            </Text>
          </Text>
        </View>
      )}

      {authState === "loggedOut" && (
        <View style={{ paddingTop: tokens.spacing.xl }}>
          <Text style={styles.h1}>Bienvenue</Text>

          <Card style={{ gap: tokens.spacing.sm }}>
            <RetroButton title="Se connecter" onPress={() => setAuthState("logIn")} />
            <RetroButton title="S'inscrire" onPress={() => setAuthState("signUp")} />
          </Card>
        </View>
      )}

      {authState === "signUp" && (
        <View style={{ paddingTop: tokens.spacing.xl }}>
          <Text style={styles.h1}>Inscription</Text>
          <Card style={{ gap: tokens.spacing.sm }}>
            <RetroInput
              value={username}
              onChangeText={setUsername}
              placeholder="Nom d'utilisateur"
              autoCorrect={false}
            />

            <RetroInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <RetroInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
            />

            <RetroInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
            />

            <RetroButton title="S'inscrire" onPress={signUp} />
          </Card>

          <Text style={[styles.h2, styles.centered]}>
            Déjà un compte ?{" "}
            <Text style={styles.link} onPress={() => setAuthState("logIn")}>
              Se connecter
            </Text>
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: {
    color: tokens.colors.text,
    fontSize: tokens.typography.h1,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    marginBottom: tokens.spacing.md,
  },
  h2: {
    color: tokens.colors.muted,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: 12,
    marginTop: tokens.spacing.md,
  },
  link: {
    color: "#4da3ff",
    textDecorationLine: "underline",
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: 12,
  },
  centered: {
    textAlign: "center",
  },
  version: {
    position: "absolute",
    bottom: tokens.spacing.md,
    right: tokens.spacing.sm,
    color: tokens.colors.muted,
    fontSize: tokens.typography.version ?? 12,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
  },
});
