import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";

import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import { Card, RetroButton, RetroInput } from "../theme/components";

export default function AddIngredientScreen() {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    if (!name.trim()) {
      Alert.alert("Erreur", "Nom de l'ingrédient vide");
      return;
    }

    // 🔐 Vérifie que l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert("Non connecté", "Vous devez être connecté pour ajouter un ingrédient");
      return;
    }

    try {
      setLoading(true);

      const zoneIdNumber = zoneId === "" ? null : Number(zoneId);

      const { data, error } = await supabase
        .from("Ingredient")
        .insert({
          name: name,
          unit: unit,
          zoneId: zoneIdNumber,
        })
        .select();

      if (error) throw error;

      console.log("INSERT OK", data);

      setName("");
      Alert.alert("Succès", "Ingrédient ajouté");

    } catch (e: any) {
      console.log("SUPABASE ERROR", e);

      Alert.alert(
        "Error",
        e?.message ||
        e?.details ||
        e?.hint ||
        "L'ajout a échoué"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Ajouter un ingrédient</Text>

      <Card style={{ gap: tokens.spacing.sm }}>
        <RetroInput
          value={name}
          onChangeText={setName}
          placeholder="Nom de l'ingrédient"
        />

        <RetroInput
          value={unit}
          onChangeText={setUnit}
          placeholder="Unité de l'ingrédient"
        />

        <RetroInput
          value={zoneId}
          onChangeText={setZoneId}
          placeholder="Zone de l'ingrédient"
        />

        <RetroButton
          title={loading ? "Chargement..." : "Ajouter"}
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
