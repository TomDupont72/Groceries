import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";

import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import {
  Card,
  RetroButton,
  RetroInput,
  RetroRow,
  RetroCheckbox,
} from "../theme/components";

// Recettes disponibles (catalogue)
type RecipeCatalogRow = {
  id: number | string;
  name: string;
};

// Lignes de ta course (liaison GroceryRecipe + join Recipe.name)
type GroceryLineRow = {
  id: number | string;
  groceryId: number | string;
  recipeId: number | string;
  quantity: number | null;
  recipe?: { name: string } | null;
};

export default function GroceriesScreen() {
  const [loading, setLoading] = useState(false);

  const [groceryId, setGroceryId] = useState<number | string | null>(null);

  const [recipeCatalog, setRecipeCatalog] = useState<RecipeCatalogRow[]>([]);
  const [groceryLines, setGroceryLines] = useState<GroceryLineRow[]>([]);

  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Array<number | string>>(
    []
  );

  const [quantitiesByRecipeId, setQuantitiesByRecipeId] = useState<{
    [key: string]: string;
  }>({});

  const selectedCount = selectedRecipeIds.length;

  const toggleRecipe = (id: number | string) => {
    const key = String(id);

    setSelectedRecipeIds((prev) => {
      const isSelected = prev.includes(id);

      if (isSelected) {
        setQuantitiesByRecipeId((qPrev) => {
          const copy = { ...qPrev };
          delete copy[key];
          return copy;
        });
        return prev.filter((x) => x !== id);
      }

      setQuantitiesByRecipeId((qPrev) => ({ ...qPrev, [key]: "" }));
      return [...prev, id];
    });
  };

  const setQuantityForRecipe = (id: number | string, value: string) => {
    const key = String(id);
    setQuantitiesByRecipeId((prev) => ({ ...prev, [key]: value }));
  };

  const selectedLabel = useMemo(() => {
    if (selectedCount === 0) return "Pas de recette sélectionnée";
    if (selectedCount === 1) return "1 recette sélectionnée";
    return `${selectedCount} recettes sélectionnées`;
  }, [selectedCount]);

  const getOrCreateGroceryId = async (userId: string) => {
    const { data: existing, error: existingError } = await supabase
      .from("Grocery")
      .select("id")
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing?.id != null) return existing.id;

    const { data: created, error: createdError } = await supabase
      .from("Grocery")
      .insert({ userId })
      .select("id")
      .single();

    if (createdError) throw createdError;
    if (!created?.id) throw new Error("Grocery creation returned no id");

    return created.id;
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
      if (!userId) throw new Error("User not authenticated");

      const gid = await getOrCreateGroceryId(userId);
      setGroceryId(gid);

      const { data: recipesData, error: recipesError } = await supabase
        .from("Recipe")
        .select("id,name")
        .order("name", { ascending: true });

      if (recipesError) throw recipesError;
      setRecipeCatalog((recipesData ?? []) as RecipeCatalogRow[]);

      const { data: linesData, error: linesError } = await supabase
        .from("GroceryRecipe")
        .select("id,groceryId,recipeId,quantity,recipe:Recipe(name)")
        .eq("groceryId", gid);

      if (linesError) throw linesError;

      const mappedLines: GroceryLineRow[] = (linesData ?? []).map((l: any) => ({
        id: l.id,
        groceryId: l.groceryId,
        recipeId: l.recipeId,
        quantity: l.quantity,
        recipe: l.recipe ?? null,
      }));

      setGroceryLines(mappedLines);
    } catch (e: any) {
      console.log("LOAD ERROR", e);
      Alert.alert("Error", e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const submit = async () => {
    if (loading) return;

    if (selectedRecipeIds.length === 0) {
      Alert.alert("Error", "Select at least 1 recipe");
      return;
    }

    const hasEmptyQuantity = selectedRecipeIds.some((id) => {
      const q = quantitiesByRecipeId[String(id)] ?? "";
      return q.trim() === "";
    });

    if (hasEmptyQuantity) {
      Alert.alert("Error", "Fill quantity for each selected recipe");
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
      if (!userId) throw new Error("User not authenticated");

      const gid = groceryId ?? (await getOrCreateGroceryId(userId));
      setGroceryId(gid);

      const rows = selectedRecipeIds.map((recipeId) => {
        const key = String(recipeId);
        const quantityStr = quantitiesByRecipeId[key] ?? "";
        const quantityNumber = quantityStr.trim() === "" ? null : Number(quantityStr);

        if (quantityNumber !== null && Number.isNaN(quantityNumber)) {
          throw new Error(`Invalid quantity for recipeId=${key}`);
        }

        return {
          groceryId: gid,
          recipeId,
          quantity: quantityNumber,
        };
      });

      const { error: insertError } = await supabase.from("GroceryRecipe").insert(rows);
      if (insertError) throw insertError;

      setSelectedRecipeIds([]);
      setQuantitiesByRecipeId({});
      Alert.alert("Success", "Grocery updated");

      await loadAll();
    } catch (e: any) {
      console.log("SUPABASE ERROR", e);
      Alert.alert("Error", e?.message || "Insert failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl * 3, paddingTop: tokens.spacing.xl }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.h1}>Gérer les courses</Text>

      <Card style={{ gap: tokens.spacing.sm }}>
        <Text style={styles.h2}>Ajouter des recettes aux courses</Text>
        <Text style={styles.muted}>{selectedLabel}</Text>

        <View style={{ gap: tokens.spacing.xs }}>
          {recipeCatalog.length === 0 ? (
            <Text style={styles.muted}>
              Pas encore de recette. Veuillez ajouter une recette d'abord.
            </Text>
          ) : (
            recipeCatalog.map((rec) => {
              const selected = selectedRecipeIds.includes(rec.id);
              const quantity = quantitiesByRecipeId[String(rec.id)] ?? "";

              return (
                <RetroRow
                  key={String(rec.id)}
                  selected={selected}
                  onPress={() => toggleRecipe(rec.id)}
                >
                  <View style={styles.left}>
                    <View style={styles.titleRow}>
                      <RetroCheckbox checked={selected} />
                      <Text style={styles.itemName}>{rec.name}</Text>
                    </View>
                  </View>

                  {selected ? (
                    <View style={styles.right}>
                      <RetroInput
                        value={quantity}
                        onChangeText={(txt) => setQuantityForRecipe(rec.id, txt)}
                        placeholder="Quantité"
                      />
                    </View>
                  ) : (
                    <View style={styles.right} />
                  )}
                </RetroRow>
              );
            })
          )}
        </View>

        <RetroButton
          title={loading ? "Chargement..." : "Ajouter aux courses"}
          onPress={submit}
        />
      </Card>

      <Card style={{ gap: tokens.spacing.sm }}>
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Mes courses</Text>
          <RetroButton title={loading ? "..." : "Rafraîchir"} onPress={loadAll} />
        </View>

        {groceryLines.length === 0 ? (
          <Text style={styles.muted}>Pas encore de recette.</Text>
        ) : (
          groceryLines.map((line) => (
            <View key={String(line.id)} style={styles.recipeRow}>
              <Text style={styles.recipeName}>
                {line.recipe?.name ?? `Recette #${String(line.recipeId)}`}
              </Text>
              <Text style={styles.recipeMeta}>Quantité: {line.quantity ?? "-"}</Text>
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

  left: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  right: {
    width: 110,
  },
  itemName: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: tokens.typography.fontSize,
  },

  recipeRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: tokens.colors.card,
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    borderRadius: 0,
    gap: 6,
  },
  recipeName: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
  },
  recipeMeta: {
    color: tokens.colors.muted,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: 12,
  },
});
