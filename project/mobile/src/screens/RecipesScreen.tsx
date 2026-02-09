import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";

import { supabase } from "../api/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Card, Input, List, ListItem, ListItemInput, ListItemText, Checkbox, Button } from "../theme/index"

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
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [recipeName, setRecipeName] = useState("");

  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);

  const [selectedIngredientIds, setSelectedIngredientIds] = useState<(number | string)[]>([]);

  const [quantitiesByIngredientId, setQuantitiesByIngredientId] = useState<{
    [key: string]: string;
  }>({});

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
        const quantityNumber = quantityStr.trim() === "" ? null : Number(quantityStr);

        if (quantityNumber !== null && Number.isNaN(quantityNumber)) {
          throw new Error(`Invalid quantity for ingredientId=${key}`);
        }

        return {
          ingredientId,
          recipeId,
          quantity: quantityNumber,
        };
      });

      const { error: linkError } = await supabase.from("RecipeIngredient").insert(rows);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.section, { paddingBottom: theme.spacing.xl * 3 }]}>
        <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Gérer les recettes</Text>
        <Card variant="outlined" padding="md" style={styles.section}>
          <Input label="Nom de la recette" value={recipeName} onChangeText={setRecipeName} containerStyle={{ marginBottom: theme.spacing.md }}/>
          <List header="Ingredients" columns={[20, "flex", 60, 65]}>
            {ingredients.map((item) => (
              <ListItem key={item.id}>
                <Checkbox checked={selectedIngredientIds.includes(item.id)} onPress={() => toggleIngredient(item.id)}/>
                <ListItemText>{item.name}</ListItemText>
                <ListItemInput value={quantitiesByIngredientId[item.id]} onChangeText={(txt) => setQuantityForIngredient(item.id, txt)} placeholder="Qté" keyboardType="numeric"/>
                <ListItemText variant="muted">{item.unit}</ListItemText>
              </ListItem>
            ))}
          </List>
          <Button title="Ajouter une recette" onPress={submit} fullWidth loading={loading}/>
        </Card>
        <View style={styles.rowBetween}>
          <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Mes recettes</Text>
          <Button title="Rafraîchir" onPress={loadAll} loading={loading}/>
        </View>
        <Card variant="outlined" padding="md" style={styles.section}>
          <List header="Recettes" columns={["flex"]}>
            {recipes.map((item) => (
              <ListItem key={item.id}>
                <ListItemText>{item.name}</ListItemText>
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