import React, { useEffect, useMemo, useState } from "react";
import { Text, StyleSheet, Alert } from "react-native";

import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import { Card, RetroButton, RetroInput } from "../theme/components";
import { Screen } from "../theme/Screen";
import ComboBox from "../components/ComboBox";

type ZoneRow = {
  id: number;
  name: string;
};

export default function AddIngredientScreen() {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [zoneId, setZoneId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [zoneData, setZoneData] = useState<ZoneRow[]>([]);
  const [zoneName, setZoneName] = useState("");

  const zonesDict = useMemo(() => {
    const out: { [key: string]: string } = {};
    for (const z of zoneData) {
      out[z.name] = String(z.id);
    }
    return out;
  }, [zoneData]);

  const submit = async () => {
    if (loading) return;

    if (!name.trim()) {
      Alert.alert("Erreur", "Nom de l'ingrédient vide");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("Ingredient")
        .insert({
          name: name,
          unit: unit,
          zoneId: zoneId,
        })
        .select();

      if (error) throw error;

      console.log("INSERT OK", data);

      setName("");
      setUnit("");
      setZoneName("");
      Alert.alert("Succès", "Ingrédient ajouté");
    } catch (e: any) {
      console.log("SUPABASE ERROR", e);

      Alert.alert("Error", e?.message || e?.details || e?.hint || "L'ajout a échoué");
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error("Utilisateur non connecté");

      const { data: zoneData, error: zoneError } = await supabase
        .from("Zone")
        .select("id, name")
        .order("name", { ascending: true });

      if (zoneError) throw zoneError;

      setZoneData(zoneData);
    } catch (e: any) {
      console.log("LOAD ERROR", e);
      Alert.alert("Error", e?.message || e?.details || e?.hint || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <Screen style={{ paddingTop: tokens.spacing.xl * 2, gap: tokens.spacing.lg }}>
      <Text style={styles.h1}>Ajouter un ingrédient</Text>

      <Card style={{ gap: tokens.spacing.sm }}>
        <RetroInput value={name} onChangeText={setName} placeholder="Nom de l'ingrédient" />

        <RetroInput value={unit} onChangeText={setUnit} placeholder="Unité de l'ingrédient" />

        <ComboBox
          dict={zonesDict}
          value={zoneName}
          onChange={setZoneName}
          onPick={(it) => {
            setZoneId(Number(it.cat));
          }}
          placeholder="Choisir une zone"
          max={6}
        />

        <RetroButton title={loading ? "Chargement..." : "Ajouter"} onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing.lg,
  },
  h1: {
    color: tokens.colors.text,
    fontSize: tokens.typography.h1,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    marginBottom: tokens.spacing.md,
  },
  h2: {
    color: tokens.colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  muted: {
    color: tokens.colors.text,
    opacity: 0.7,
  },
  mutedSmall: {
    color: tokens.colors.text,
    opacity: 0.6,
    fontSize: 12,
  },

  ingRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  ingRowSelected: {
    borderColor: "rgba(255,255,255,0.5)",
  },
  ingLeft: {
    flex: 1,
    gap: 4,
  },
  ingRight: {
    width: 110,
  },
  ingName: {
    color: tokens.colors.text,
    fontWeight: "800",
  },
  ingMeta: {
    color: tokens.colors.text,
    opacity: 0.7,
    fontSize: 12,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recipeRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 4,
  },
  recipeName: {
    color: tokens.colors.text,
    fontWeight: "900",
  },
});
