import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";

import { supabase } from "../api/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Card, List, ListItem, ListItemInput, ListItemText, Checkbox, Button } from "../theme/index"

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
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);

  const [groceryId, setGroceryId] = useState<number | string | null>(null);

  const [recipeCatalog, setRecipeCatalog] = useState<RecipeCatalogRow[]>([]);
  const [groceryLines, setGroceryLines] = useState<GroceryLineRow[]>([]);

  const [selectedRecipeIds, setSelectedRecipeIds] = useState<(number | string)[]>([]);

  const [quantitiesByRecipeId, setQuantitiesByRecipeId] = useState<{
    [key: string]: string;
  }>({});

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

  const loadAll = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.section, { paddingBottom: theme.spacing.xl * 3 }]}>
        <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Gérer les courses</Text>
        <Card variant="outlined" padding="md" style={styles.section}>
          <List header="Recettes" columns={[20, "flex", 60]}>
            {recipeCatalog.map((item) => (
              <ListItem key={item.id}>
                <Checkbox checked={selectedRecipeIds.includes(item.id)} onPress={() => toggleRecipe(item.id)}/>
                <ListItemText>{item.name}</ListItemText>
                <ListItemInput value={quantitiesByRecipeId[item.id]} onChangeText={(txt) => setQuantityForRecipe(item.id, txt)} placeholder="Qté" keyboardType="numeric"/>
              </ListItem>
            ))}
          </List>
          <Button title="Ajouter aux courses" onPress={submit} fullWidth loading={loading}/>
        </Card>
        <View style={styles.rowBetween}>
          <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Mes courses</Text>
          <Button title="Rafraîchir" onPress={loadAll} loading={loading}/>
        </View>
        <Card variant="outlined" padding="md" style={styles.section}>
          <List header="Courses" columns={["flex", 70]} columnHeaders={["Recette", "Quantité"]}>
            {groceryLines.map((item) => (
              <ListItem key={item.id}>
                <ListItemText>{item.recipe?.name ?? `Recette #${String(item.recipeId)}`}</ListItemText>
                <ListItemText style={{alignSelf: "center"}}>{item.quantity ?? "-"}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 18,
  },
  section: {
    flexDirection: "column",
    gap: 18,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
});