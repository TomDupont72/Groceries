import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import {
  Card,
  RetroButton,
  RetroInput,
  RetroRow,
  RetroCheckbox,
} from "../theme/components";
import { Screen } from "../theme/Screen";

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
  const [recipeName, setRecipeName] = useState("");

  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);

  const [selectedIngredientIds, setSelectedIngredientIds] = useState<
    Array<number | string>
  >([]);

  const [quantitiesByIngredientId, setQuantitiesByIngredientId] = useState<{
    [key: string]: string;
  }>({});

  const selectedCount = selectedIngredientIds.length;

  const toggleIngredient = (id: number | string) => {
    const key = String(id);

    setSelectedIngredientIds((prev) => {
      const isSelected = prev.includes(id);

      if (isSelected) {
        setQuantitiesByIngredientId((qPrev) => {
          const copy = { ...qPrev };
          delete copy[key];
          return copy;
        });
        return prev.filter((x) => x !== id);
      }

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

      const { data: ingData, error: ingError } = await supabase
        .from("Ingredient")
        .select("id,name,unit,zoneId")
        .order("name", { ascending: true });

      if (ingError) throw ingError;

      const { data: recData, error: recError } = await supabase
        .from("Recipe")
        .select("id,name,createdAt")
        .order("createdAt", { ascending: false });

      if (recError) throw recError;

      setIngredients((ingData ?? []) as IngredientRow[]);
      setRecipes((recData ?? []) as RecipeRow[]);
    } catch (e: any) {
      console.log("LOAD ERROR", e);
      Alert.alert("Erreur", e?.message || "Le chargement a échoué");
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

    const hasEmptyQuantity = selectedIngredientIds.some((id) => {
      const key = String(id);
      const q = quantitiesByIngredientId[key] ?? "";
      return q.trim() === "";
    });

    if (hasEmptyQuantity) {
      Alert.alert(
        "Erreur",
        "Veuillez remplir la quantité de tous les ingrédients"
      );
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

      const { data: recipeInserted, error: recipeError } = await supabase
        .from("Recipe")
        .insert({ name: recipeName.trim() })
        .select("id")
        .single();

      if (recipeError) throw recipeError;

      const recipeId = recipeInserted?.id;
      if (!recipeId) throw new Error("Recipe insert returned no id");

      const rows = selectedIngredientIds.map((ingredientId) => {
        const key = String(ingredientId);
        const quantityStr = quantitiesByIngredientId[key] ?? "";
        const quantityNumber =
          quantityStr.trim() === "" ? null : Number(quantityStr);

        if (quantityNumber !== null && Number.isNaN(quantityNumber)) {
          throw new Error(`Invalid quantity for ingredientId=${key}`);
        }

        return {
          ingredientId,
          recipeId,
          quantity: quantityNumber,
        };
      });

      const { error: linkError } = await supabase
        .from("RecipeIngredient")
        .insert(rows);

      if (linkError) throw linkError;

      setRecipeName("");
      setSelectedIngredientIds([]);
      setQuantitiesByIngredientId({});
      Alert.alert("Succès", "Recette ajoutée");

      await loadAll();
    } catch (e: any) {
      console.log("SUPABASE ERROR", e);
      Alert.alert("Erreur", e?.message || "L'ajout a échoué");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ paddingTop: tokens.spacing.xl}}>
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl * 3 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.h1}>Gérer les recettes</Text>

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
              const quantity =
                quantitiesByIngredientId[String(ing.id)] ?? "";

              return (
                <RetroRow
                  key={String(ing.id)}
                  selected={selected}
                  onPress={() => toggleIngredient(ing.id)}
                >
                  <View style={styles.ingLeft}>
                    <View style={styles.ingTitleRow}>
                      <RetroCheckbox checked={selected} />
                      <Text style={styles.ingName}>{ing.name}</Text>
                    </View>
                    {!!ing.unit && (
                      <Text style={styles.ingMeta}>{ing.unit}</Text>
                    )}
                  </View>

                  {selected ? (
                    <View style={styles.ingRight}>
                      <RetroInput
                        value={quantity}
                        onChangeText={(txt) =>
                          setQuantityForIngredient(ing.id, txt)
                        }
                        placeholder="Qty"
                      />
                    </View>
                  ) : (
                    <View style={styles.ingRight} />
                  )}
                </RetroRow>
              );
            })
          )}
        </View>

        <RetroButton
          title={loading ? "Chargement..." : "Ajouter une recette"}
          onPress={submit}
        />
      </Card>

      <Card style={{ gap: tokens.spacing.sm }}>
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Mes recettes</Text>
          <RetroButton
            title={loading ? "..." : "Rafraîchir"}
            onPress={loadAll}
          />
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
    fontSize: tokens.typography.h2,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    marginBottom: tokens.spacing.md,
  },

  muted: {
    color: tokens.colors.muted,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ingLeft: {
    flex: 1,
    gap: 6,
  },
  ingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ingRight: {
    width: 110,
  },
  ingName: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: tokens.typography.fontSize,
  },
  ingMeta: {
    color: tokens.colors.muted,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: 12,
  },

  recipeRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: tokens.colors.card,
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    borderRadius: 0,
  },
  recipeName: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
  },
});
