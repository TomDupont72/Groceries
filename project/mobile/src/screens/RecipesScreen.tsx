import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import { Card, RetroButton, RetroInput } from "../theme/components";

type IngredientRow = {
  id: number | string;
  name: string;
  unit?: string | null;
  zoneId?: number | null;
};

type RecipeRow = {
  id: number | string;
  name: string;
  createdAt?: string;
};

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);

  // Add recipe form
  const [recipeName, setRecipeName] = useState("");

  // Data
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);

  // ✅ Selected ingredients + quantity per ingredient (keeps your naming style)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<
    Array<number | string>
  >([]);
  const [quantitiesByIngredientId, setQuantitiesByIngredientId] = useState<
    Record<string, string>
  >({});

  const selectedCount = selectedIngredientIds.length;

  const toggleIngredient = (id: number | string) => {
    const key = String(id);

    setSelectedIngredientIds((prev) => {
      const isSelected = prev.includes(id);

      if (isSelected) {
        // remove
        setQuantitiesByIngredientId((qPrev) => {
          const copy = { ...qPrev };
          delete copy[key];
          return copy;
        });
        return prev.filter((x) => x !== id);
      }

      // add
      setQuantitiesByIngredientId((qPrev) => ({ ...qPrev, [key]: "" }));
      return [...prev, id];
    });
  };

  const setQuantityForIngredient = (id: number | string, value: string) => {
    const key = String(id);
    setQuantitiesByIngredientId((prev) => ({ ...prev, [key]: value }));
  };

  const selectedLabel = useMemo(() => {
    if (selectedCount === 0) return "Pas d'ingrédient sélectionné";
    if (selectedCount === 1) return "1 ingrédient sélectionné";
    return `${selectedCount} ingrédients sélectionnés`;
  }, [selectedCount]);

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

      // 1) Load ingredients
      const { data: ingData, error: ingError } = await supabase
        .from("Ingredient")
        .select("id,name,unit,zoneId")
        .order("name", { ascending: true });

      if (ingError) throw ingError;

      // 2) Load recipes
      const { data: recData, error: recError } = await supabase
        .from("Recipe")
        .select("id,name,createdAt")
        .order("createdAt", { ascending: false });

      if (recError) throw recError;

      setIngredients((ingData ?? []) as IngredientRow[]);
      setRecipes((recData ?? []) as RecipeRow[]);
    } catch (e: any) {
      console.log("LOAD ERROR", e);
      Alert.alert("Erreur", e?.message || e?.details || e?.hint || "Le chargement a échoué");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const submit = async () => {
    if (loading) return;

    if (!recipeName.trim()) {
      Alert.alert("Erreur", "Le nom de la recette est vide");
      return;
    }

    if (selectedIngredientIds.length === 0) {
      Alert.alert("Erreur", "Selectionnez au moins 1 ingrédient");
      return;
    }

    // Optional: ensure quantities are filled (you can remove this if you want quantity optional)
    const hasEmptyQuantity = selectedIngredientIds.some((id) => {
      const key = String(id);
      const q = quantitiesByIngredientId[key] ?? "";
      return q.trim() === "";
    });

    if (hasEmptyQuantity) {
      Alert.alert("Erreur", "Veuillez remplir la quantité de tous les ingrédients");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error("Utilisateur non connecté");

      // 1) Create recipe
      const { data: recipeInserted, error: recipeError } = await supabase
        .from("Recipe")
        .insert({
          name: recipeName.trim(),
        })
        .select("id")
        .single();

      if (recipeError) throw recipeError;

      const recipeId = recipeInserted?.id;
      if (!recipeId) throw new Error("Recipe insert returned no id");

      // 2) Insert recipe-ingredient relations (✅ quantity per ingredient)
      const rows = selectedIngredientIds.map((ingredientId) => {
        const key = String(ingredientId);
        const quantityStr = quantitiesByIngredientId[key] ?? "";
        const quantityNumber = quantityStr.trim() === "" ? null : Number(quantityStr);

        // If you want to prevent NaN inserts:
        if (quantityNumber !== null && Number.isNaN(quantityNumber)) {
          throw new Error(`Invalid quantity for ingredientId=${key}`);
        }

        return {
          ingredientId: ingredientId,
          recipeId: recipeId,
          quantity: quantityNumber, // assumes column "quantity" exists (numeric) in RecipeIngredient
        };
      });

      const { error: linkError } = await supabase.from("RecipeIngredient").insert(rows);
      if (linkError) throw linkError;

      // Reset form + refresh lists
      setRecipeName("");
      setSelectedIngredientIds([]);
      setQuantitiesByIngredientId({});
      Alert.alert("Succès", "Recette ajoutée");

      await loadAll();
    } catch (e: any) {
      console.log("SUPABASE ERROR", e);
      Alert.alert("Erreur", e?.message || e?.details || e?.hint || "L'ajout a échoué");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ gap: tokens.spacing.lg }}
    >
      <Text style={styles.h1}>Gérer les recettes</Text>

      {/* Create recipe */}
      <Card style={{ gap: tokens.spacing.sm }}>
        <Text style={styles.h2}>Créer une recette</Text>

        <RetroInput
          value={recipeName}
          onChangeText={setRecipeName}
          placeholder="Nom de la recette"
        />

        <Text style={styles.muted}>{selectedLabel}</Text>

        <View style={{ gap: tokens.spacing.xs }}>
          {ingredients.length === 0 ? (
            <Text style={styles.muted}>
              Pas encore d'ingrédient. Veuillez d'abord ajouter un ingrédient.
            </Text>
          ) : (
            ingredients.map((ing) => {
              const selected = selectedIngredientIds.includes(ing.id);
              const quantity = quantitiesByIngredientId[String(ing.id)] ?? "";

              return (
                <TouchableOpacity
                  key={String(ing.id)}
                  onPress={() => toggleIngredient(ing.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.ingRow,
                    selected ? styles.ingRowSelected : null,
                  ]}
                >
                  <View style={styles.ingLeft}>
                    <Text style={styles.ingName}>
                      {selected ? "✅ " : "⬜ "} {ing.name}
                    </Text>
                    {!!ing.unit && (
                      <Text style={styles.ingMeta}>{ing.unit}</Text>
                    )}
                  </View>

                  {selected ? (
                    <View style={styles.ingRight}>
                      <RetroInput
                        value={quantity}
                        onChangeText={(txt) => setQuantityForIngredient(ing.id, txt)}
                        placeholder="Qty"
                      />
                    </View>
                  ) : (
                    <View style={styles.ingRight} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <RetroButton
          title={loading ? "Chargement..." : "Ajouter une recette"}
          onPress={submit}
        />
      </Card>

      {/* List recipes */}
      <Card style={{ gap: tokens.spacing.sm }}>
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Mes recettes</Text>
          <RetroButton title={loading ? "..." : "Rafraîchir"} onPress={loadAll} />
        </View>

        {recipes.length === 0 ? (
          <Text style={styles.muted}>Pas encore de recettes.</Text>
        ) : (
          recipes.map((r) => (
            <View key={String(r.id)} style={styles.recipeRow}>
              <Text style={styles.recipeName}>{r.name}</Text>
            </View>
          ))
        )}
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
