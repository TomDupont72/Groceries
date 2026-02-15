import React from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Button, Card, Input, Badge, Loading } from "../theme/index";
import { useHomeScreen } from "../hooks/useHome";

export default function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const {
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
    signUp,
  } = useHomeScreen();

  if (loadingPage) return <Loading />;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      {authState === "loggedIn" && (
        <View style={{ flex: 1 }}>
          <View style={styles.section}>
            <Text
              style={{
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontSize: theme.fontSize.xxl,
              }}
            >
              Bonjour {username || "👋"}
            </Text>
            <Card variant="outlined" padding="md" style={styles.section}>
              <Button
                title="Ajouter un ingrédient"
                onPress={() => navigation.navigate("AddIngredient")}
                fullWidth
              />
              <Button
                title="Gérer les recettes"
                onPress={() => navigation.navigate("Recipes")}
                fullWidth
              />
              <Button
                title="Gérer les courses"
                onPress={() => navigation.navigate("Groceries")}
                fullWidth
              />
              <Button
                title="Faire les courses"
                onPress={() => navigation.navigate("Buying")}
                fullWidth
              />
              <Button title="Se déconnecter" onPress={logout} fullWidth />
              {errorMsg ? (
                <View style={styles.errorRow}>
                  <Badge variant="error" style={{ alignSelf: "center" }}>
                    Erreur
                  </Badge>
                  <Text
                    style={[
                      styles.errorText,
                      {
                        flex: 1,
                        color: theme.colors.text,
                        fontFamily: theme.fontFamily.mono.md,
                        fontSize: theme.fontSize.md,
                      },
                    ]}
                  >
                    {errorMsg}
                  </Text>
                </View>
              ) : null}
            </Card>
            {appVersion !== "" && appVersion !== version && (
              <Text
                style={[
                  styles.centered,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fontFamily.mono.sm,
                    fontSize: theme.fontSize.sm,
                  },
                ]}
              >
                Vous êtes sur une ancienne version,{" "}
                <Text style={styles.link} onPress={() => appLink && Linking.openURL(appLink)}>
                  cliquez ici
                </Text>{" "}
                pour mettre à jour.
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.version,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.sm,
                fontSize: theme.fontSize.sm,
              },
            ]}
          >
            v{version}
          </Text>
        </View>
      )}

      {authState === "logIn" && (
        <View style={styles.section}>
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.md,
              fontSize: theme.fontSize.xxl,
            }}
          >
            Connexion
          </Text>
          <Card variant="outlined" padding="md" style={styles.section}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ marginBottom: theme.spacing.md }}
            />
            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={{ marginBottom: theme.spacing.md }}
            />
            {errorMsg ? (
              <View style={styles.errorRow}>
                <Badge variant="error" style={{ alignSelf: "center" }}>
                  Erreur
                </Badge>
                <Text
                  style={[
                    styles.errorText,
                    {
                      flex: 1,
                      color: theme.colors.text,
                      fontFamily: theme.fontFamily.mono.md,
                      fontSize: theme.fontSize.md,
                    },
                  ]}
                >
                  {errorMsg}
                </Text>
              </View>
            ) : null}
            <Button title="Se connecter" onPress={login} fullWidth />
          </Card>
        </View>
      )}

      {authState === "loggedOut" && (
        <View style={styles.section}>
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.md,
              fontSize: theme.fontSize.xxl,
            }}
          >
            Bienvenue
          </Text>
          <Card variant="outlined" padding="md" style={styles.section}>
            <Button title="Se connecter" onPress={() => setAuthState("logIn")} fullWidth />
            <Button title="S'inscrire" onPress={() => setAuthState("signUp")} fullWidth />
            {errorMsg ? (
              <View style={styles.errorRow}>
                <Badge variant="error" style={{ alignSelf: "center" }}>
                  Erreur
                </Badge>
                <Text
                  style={[
                    styles.errorText,
                    {
                      flex: 1,
                      color: theme.colors.text,
                      fontFamily: theme.fontFamily.mono.md,
                      fontSize: theme.fontSize.md,
                    },
                  ]}
                >
                  {errorMsg}
                </Text>
              </View>
            ) : null}
          </Card>
        </View>
      )}

      {authState === "signUp" && (
        <View style={styles.section}>
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.md,
              fontSize: theme.fontSize.xxl,
            }}
          >
            Inscription
          </Text>
          <Card variant="outlined" padding="md" style={styles.section}>
            <Input
              label="Nom d'utilisateur"
              value={username}
              onChangeText={setUsername}
              autoCorrect={false}
              containerStyle={{ marginBottom: theme.spacing.md }}
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ marginBottom: theme.spacing.md }}
            />
            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={{ marginBottom: theme.spacing.md }}
            />
            <Input
              label="Confirmer le mot de passe"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              containerStyle={{ marginBottom: theme.spacing.md }}
            />
            {errorMsg ? (
              <View style={styles.errorRow}>
                <Badge variant="error" style={{ alignSelf: "center" }}>
                  Erreur
                </Badge>
                <Text
                  style={[
                    styles.errorText,
                    {
                      flex: 1,
                      color: theme.colors.text,
                      fontFamily: theme.fontFamily.mono.md,
                      fontSize: theme.fontSize.md,
                    },
                  ]}
                >
                  {errorMsg}
                </Text>
              </View>
            ) : null}
            <Button title="S'inscrire'" onPress={signUp} fullWidth />
          </Card>
          <Text
            style={[
              styles.centered,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.sm,
                fontSize: theme.fontSize.sm,
              },
            ]}
          >
            Déjà un compte ?{" "}
            <Text style={styles.link} onPress={() => setAuthState("logIn")}>
              Se connecter
            </Text>
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  errorText: {
    flex: 1,
    flexWrap: "wrap",
  },
});
