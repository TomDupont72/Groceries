import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";

import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import { Card, RetroButton, RetroInput } from "../theme/components";

type ZoneRow = {
  id: number;
  name: string;
};

export default function AddIngredientScreen() {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [zoneId, setZoneId] = useState<Number>();
  const [loading, setLoading] = useState(false);
  const [zoneData, setZoneData] = useState<ZoneRow[]>([]);

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

  const toggleZone = (id: number) => {
    setZoneId(id);
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    
    <ScrollView style={styles.page}
    contentContainerStyle={{ gap: tokens.spacing.lg }}
    >
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

        <View style = {{ gap: tokens.spacing.xs }}>
          {zoneData.length === 0 ? (
            <Text style = {styles.muted}>
              Pas encore de zone. Veuillez d'abord ajouter des zones.
            </Text>
          ) : (
            zoneData.map((zone) => {
              const selected = zoneId === zone.id;

              return (
                <TouchableOpacity
                  key={zone.id}
                  activeOpacity={0.8}
                  onPress={() => toggleZone(zone.id)}
                  style={[
                    styles.ingRow,
                    selected ? styles.ingRowSelected : null,
                  ]}>
                    <View style={styles.ingLeft}>
                      <Text style={styles.ingName}>
                        {selected ? "✅ " : "⬜ "} {zone.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
              );
            })
          )}
        </View>

        <RetroButton
          title={loading ? "Chargement..." : "Ajouter"}
          onPress={submit}
        />
      </Card>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
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
