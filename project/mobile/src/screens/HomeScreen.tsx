import React, { useState } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { tokens } from "../theme/tokens";
import { Card, RetroButton } from "../theme/components";
import { supabase } from "../api/supabase";

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
    <View style={styles.page}>
      <Text style={styles.h1}>Retro Groceries</Text>

      <Card style={{ gap: tokens.spacing.sm }}>
        <RetroButton
          title="Go to add ingredients"
          onPress={() => navigation.navigate("AddIngredient")}
        />
        <RetroButton
          title="Go to Groceries"
          onPress={() => navigation.navigate("Groceries")}
        />
        <RetroButton
          title="Go to Recipes"
          onPress={() => navigation.navigate("Recipes")}
        />

        {/* AUTH */}
        {!loggedIn ? (
          <RetroButton title="Login (test)" onPress={loginTest} />
        ) : (
          <RetroButton title="Logout" onPress={logout} />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
  },
  h1: {
    color: tokens.colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
  },
  label: {
    color: tokens.colors.muted,
    fontWeight: "700",
  },
  mono: {
    color: tokens.colors.text,
    fontFamily: "monospace",
  },
});
