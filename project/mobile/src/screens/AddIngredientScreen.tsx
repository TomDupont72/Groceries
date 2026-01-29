import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";

import { api } from "../api/client";
import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import { Card, RetroButton, RetroInput } from "../theme/components";

export default function AddIngredientScreen() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    if (!name.trim()) {
      Alert.alert("Error", "Ingredient name is empty");
      return;
    }

    // 🔐 Vérifie que l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert("Not logged in", "You must be logged in to add ingredients");
      return;
    }

    try {
      setLoading(true);

      await supabase.from("Ingredient").insert({ name });

      setName("");
      Alert.alert("Success", "Ingredient added");
    } catch (e: any) {
      console.log(e?.response?.data);

      if (e?.response?.status === 401) {
        Alert.alert("Auth error", "You are not authenticated");
      } else if (e?.response?.status === 403) {
        Alert.alert("Permission error", "Action not allowed (RLS)");
      } else {
        Alert.alert("Error", e?.response?.data?.detail ?? "API error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Add ingredient</Text>

      <Card style={{ gap: tokens.spacing.sm }}>
        <RetroInput
          value={name}
          onChangeText={setName}
          placeholder="Tomato, Rice, Olive oil…"
        />

        <RetroButton
          title={loading ? "Saving..." : "Add"}
          onPress={submit}
        />
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
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
