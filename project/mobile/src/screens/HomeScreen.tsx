import React, { useState } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { tokens } from "../theme/tokens";
import { Card, RetroButton } from "../theme/components";
import { supabase } from "../api/supabase";
import { Screen } from "../theme/Screen"

export default function HomeScreen({ navigation }: any) {
  const [loggedIn, setLoggedIn] = useState(false);

  const loginTest = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: "tomdupont72@gmail.com",
      password: "Tom*dupont7486",
    });

    if (error) {
      Alert.alert("Login error", error.message);
    } else {
      setLoggedIn(true);
      Alert.alert("Success", "Logged in");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setLoggedIn(false);
    Alert.alert("Logged out");
  };

  return (
    <Screen>
      <Text style={styles.h1}>Courses</Text>

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

        {/* AUTH */}
        {!loggedIn ? (
          <RetroButton title="Login" onPress={loginTest} />
        ) : (
          <RetroButton title="Logout" onPress={logout} />
        )}
      </Card>

      <Text style={styles.version}>v1.1.0</Text>

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
  version: {
    position: "absolute",
    fontSize: tokens.typography.version,
    fontFamily: tokens.typography.fontFamily,
    bottom: tokens.spacing.sm,
    right: tokens.spacing.sm,
    color: tokens.colors.muted,
  },
});
