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
  recipe?: { name: string } | null; // join alias
};

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);

  // Grocery unique du user
  const [groceryId, setGroceryId] = useState<number | string | null>(null);

  // Data
  const [recipeCatalog, setRecipeCatalog] = useState<RecipeCatalogRow[]>([]);
  const [groceryLines, setGroceryLines] = useState<GroceryLineRow[]>([]);

  // Sélection + quantités
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Array<number | string>>([]);
  const [quantitiesByRecipeId, setQuantitiesByRecipeId] = useState<Record<string, string>>({});

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

  // ✅ Récupère ou crée la Grocery unique
  const getOrCreateGroceryId = async (userId: string) => {
    // 1) Try get existing
    const { data: existing, error: existingError } = await supabase
      .from("Grocery")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.id != null) return existing.id;

    // 2) Create
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

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error("User not authenticated");

      // Grocery unique
      const gid = await getOrCreateGroceryId(userId);
      setGroceryId(gid);

      // 1) Load recipes catalog (les recettes à ajouter)
      const { data: recipesData, error: recipesError } = await supabase
        .from("Recipe")
        .select("id,name")
        .order("name", { ascending: true });

      if (recipesError) throw recipesError;
      setRecipeCatalog((recipesData ?? []) as RecipeCatalogRow[]);

      // 2) Load current grocery lines (avec join recipe name)
      // 👉 alias "recipe:Recipe(name)" suppose que GroceryRecipe.recipeId -> Recipe.id existe
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
      recipe: l.recipe ?? null, // objet { name }
    }));

    setGroceryLines(mappedLines);
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

  const submit = async () => {
    if (loading) return;

    if (selectedRecipeIds.length === 0) {
      Alert.alert("Error", "Select at least 1 recipe");
      return;
    }

    // quantité obligatoire (enlève ce bloc si tu veux quantité optionnelle)
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

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error("User not authenticated");

      // Grocery unique (si jamais pas encore)
      const gid = groceryId ?? (await getOrCreateGroceryId(userId));
      setGroceryId(gid);

      // Insert GroceryRecipe rows
      const rows = selectedRecipeIds.map((recipeId) => {
        const key = String(recipeId);
        const quantityStr = quantitiesByRecipeId[key] ?? "";
        const quantityNumber = quantityStr.trim() === "" ? null : Number(quantityStr);

        if (quantityNumber !== null && Number.isNaN(quantityNumber)) {
          throw new Error(`Invalid quantity for recipeId=${key}`);
        }

        return {
          groceryId: gid,
          recipeId: recipeId,
          quantity: quantityNumber,
        };
      });

      const { error: insertError } = await supabase.from("GroceryRecipe").insert(rows);
      if (insertError) throw insertError;

      // Reset selection
      setSelectedRecipeIds([]);
      setQuantitiesByRecipeId({});
      Alert.alert("Success", "Grocery updated");

      await loadAll();
    } catch (e: any) {
      console.log("SUPABASE ERROR", e);
      Alert.alert("Error", e?.message || e?.details || e?.hint || "Insert failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ gap: tokens.spacing.lg }}
    >
      <Text style={styles.h1}>Gérer les courses</Text>

      {/* Ajouter à la course */}
      <Card style={{ gap: tokens.spacing.sm }}>
        <Text style={styles.h2}>Ajouter des recettes aux courses</Text>
        <Text style={styles.muted}>{selectedLabel}</Text>

        <View style={{ gap: tokens.spacing.xs }}>
          {recipeCatalog.length === 0 ? (
            <Text style={styles.muted}>Pas encore de recette. Veuillez ajouter une recette d'abord.</Text>
          ) : (
            recipeCatalog.map((rec) => {
              const selected = selectedRecipeIds.includes(rec.id);
              const quantity = quantitiesByRecipeId[String(rec.id)] ?? "";

              return (
                <TouchableOpacity
                  key={String(rec.id)}
                  onPress={() => toggleRecipe(rec.id)}
                  activeOpacity={0.8}
                  style={[styles.ingRow, selected ? styles.ingRowSelected : null]}
                >
                  <View style={styles.ingLeft}>
                    <Text style={styles.ingName}>
                      {selected ? "✅ " : "⬜ "} {rec.name}
                    </Text>
                  </View>

                  {selected ? (
                    <View style={styles.ingRight}>
                      <RetroInput
                        value={quantity}
                        onChangeText={(txt) => setQuantityForRecipe(rec.id, txt)}
                        placeholder="Quantité"
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
          title={loading ? "Chargement..." : "Ajouter aux courses"}
          onPress={submit}
        />
      </Card>

      {/* Liste de la course */}
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
              <Text style={styles.recipeName}>
                Quantité: {line.quantity ?? "-"}
              </Text>
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
