import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { supabase } from "../api/supabase";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Button, Card, Input } from "../theme/index"

type AuthState = "loggedOut" | "logIn" | "signUp" | "loggedIn";

export default function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [authState, setAuthState] = useState<AuthState>("loggedOut");
  const [username, setUsername] = useState("");
  const version = "1.4.0";
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      {authState === "loggedIn" && (
        <View style={{ flex: 1 }}>
          <View style={styles.section}>
            <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Bonjour {username || "👋"}</Text>
            <Card variant="outlined" padding="md" style={styles.section}>
              <Button title="Ajouter un ingrédient" onPress={() => navigation.navigate("AddIngredient")} fullWidth/>
              <Button title="Gérer les recettes" onPress={() => navigation.navigate("Recipes")} fullWidth/>
              <Button title="Gérer les courses" onPress={() => navigation.navigate("Groceries")} fullWidth/>
              <Button title="Faire les courses" onPress={() => navigation.navigate("Buying")} fullWidth/>
              <Button title="Se déconnecter" onPress={logout} fullWidth/>
            </Card>
            {appVersion !== "" && appVersion !== version && (
              <Text style={[styles.centered, {color: theme.colors.text, fontFamily: theme.fontFamily.mono.sm, fontSize: theme.fontSize.sm}]}>
                Vous êtes sur une ancienne version,{" "}
                <Text style={styles.link} onPress={() => appLink && Linking.openURL(appLink)}>cliquez ici</Text>{" "}
                pour mettre à jour.
              </Text>
            )}
          </View>
          <Text style={[styles.version, {color: theme.colors.text, fontFamily: theme.fontFamily.mono.sm, fontSize: theme.fontSize.sm}]}>v{version}</Text>
        </View>
      )}

      {authState === "logIn" && (
        <View style={styles.section}>
          <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Connexion</Text>
          <Card variant="outlined" padding="md" style={styles.section}>
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" containerStyle={{ marginBottom: theme.spacing.md }}/>
            <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry containerStyle={{ marginBottom: theme.spacing.md }}/>
            <Button title="Se connecter" onPress={login} fullWidth/>
          </Card>
        </View>
      )}

      {authState === "loggedOut" && (
        <View style={styles.section}>
          <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Bienvenue</Text>
          <Card variant="outlined" padding="md" style={styles.section}>
            <Button title="Se connecter" onPress={() => setAuthState("logIn")} fullWidth/>
            <Button title="S'inscrire" onPress={() => setAuthState("signUp")} fullWidth/>
          </Card>
        </View>
      )}

      {authState === "signUp" && (
        <View style={styles.section}>
          <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Inscription</Text>
          <Card variant="outlined" padding="md" style={styles.section}>
            <Input label="Nom d'utilisateur" value={username} onChangeText={setUsername} autoCorrect={false} containerStyle={{ marginBottom: theme.spacing.md }}/>
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" containerStyle={{ marginBottom: theme.spacing.md }}/>
            <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry containerStyle={{ marginBottom: theme.spacing.md }}/>
            <Input label="Confirmer le mot de passe" value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry containerStyle={{ marginBottom: theme.spacing.md }}/>
            <Button title="S'inscrire'" onPress={signUp} fullWidth/>
          </Card>
          <Text style={[styles.centered, {color: theme.colors.text, fontFamily: theme.fontFamily.mono.sm, fontSize: theme.fontSize.sm}]}>
            Déjà un compte ?{" "}
            <Text style={styles.link} onPress={() => setAuthState("logIn")}>Se connecter</Text>
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 18,
  },
  section: {
    flexDirection: "column",
    gap: 18,
  },
  version: {
    opacity: 0.6,
    marginTop: "auto",
    textAlign: "right",
  },
  link: {
    color: "#0080FF",
    textDecorationLine: "underline",
  },

  centered: {
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: 16,
  },
});