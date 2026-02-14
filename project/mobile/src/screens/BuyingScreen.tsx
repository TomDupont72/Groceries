import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";

import { supabase } from "../api/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Card, List, ListItem, ListItemText, Checkbox, Button } from "../theme/index"

type GroceryRecipeRow = {
  id: number;
  groceryId: number;
  recipeId: number;
  quantity: number;
};

type RecipeIngredientRow = {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
};

type IngredientRow = {
  id: number;
  name: string;
  unit: string | null;
  zoneId: number | null;
  zone?: { name: string } | null;
};

type GroceryIngredientRow = {
  id: number;
  ingredientId: number;
  checked: boolean;
  userId: string;
};

type BuyItem = {
  ingredientId: number;
  name: string;
  unit: string | null;
  zoneName: string;
  zoneId: number | null;
  total: number;
  checked: boolean;
  groceryIngredientId?: number;
};

export default function BuyingScreen() {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<BuyItem[]>([]);

  const grouped = useMemo(() => {
    const map = new Map<string, BuyItem[]>();
    for (const it of items) {
      const key = it.zoneName || "Autres";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
      map.set(k, arr);
    }

    const zones = Array.from(map.keys()).sort((a, b) => {
      if (a === "Autres") return 1;
      if (b === "Autres") return -1;
      return a.localeCompare(b);
    });

    return zones.map((zoneName) => ({
      zoneName,
      items: map.get(zoneName)!,
    }));
  }, [items]);

  const getUserId = async (): Promise<string> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    const userId = user?.id;
    if (!userId) throw new Error("User not authenticated");
    return userId;
  };

  const getOrCreateGroceryId = async (userId: string): Promise<number> => {
    const { data: existing, error: existingError } = await supabase
      .from("Grocery")
      .select("id,userId")
      .eq("userId", userId)
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

      const userId = await getUserId();
      const gid = await getOrCreateGroceryId(userId);

      const { data: grData, error: grError } = await supabase
        .from("GroceryRecipe")
        .select("id,groceryId,recipeId,quantity")
        .eq("groceryId", gid);

      if (grError) throw grError;
      const groceryRecipes = (grData ?? []) as GroceryRecipeRow[];

      if (groceryRecipes.length === 0) {
        setItems([]);
        return;
      }

      const recipeIds = groceryRecipes.map((r) => r.recipeId);

      const { data: riData, error: riError } = await supabase
        .from("RecipeIngredient")
        .select("id,recipeId,ingredientId,quantity")
        .in("recipeId", recipeIds);

      if (riError) throw riError;
      const recipeIngredients = (riData ?? []) as RecipeIngredientRow[];

      const recipeMultiplier = new Map<number, number>();
      for (const r of groceryRecipes) recipeMultiplier.set(r.recipeId, r.quantity);

      const totalsByIngredientId = new Map<number, number>();
      for (const ri of recipeIngredients) {
        const mult = recipeMultiplier.get(ri.recipeId) ?? 0;
        const add = mult * (ri.quantity ?? 0);
        if (add === 0) continue;

        totalsByIngredientId.set(
          ri.ingredientId,
          (totalsByIngredientId.get(ri.ingredientId) ?? 0) + add,
        );
      }

      const ingredientIds = Array.from(totalsByIngredientId.keys());
      if (ingredientIds.length === 0) {
        setItems([]);
        return;
      }

      const { data: ingData, error: ingError } = await supabase
        .from("Ingredient")
        .select("id,name,unit,zoneId,zone:Zone(name)")
        .in("id", ingredientIds);

      if (ingError) throw ingError;

      const mappedIngredients: IngredientRow[] = (ingData ?? []).map((i: any) => ({
        id: i.id,
        name: i.name,
        unit: i.unit ?? null,
        zoneId: i.zoneId ?? null,
        zone: Array.isArray(i.zone) ? (i.zone[0] ?? null) : (i.zone ?? null),
      }));

      const ingredients = mappedIngredients;

      const { data: giData, error: giError } = await supabase
        .from("GroceryIngredient")
        .select("id,ingredientId,checked,userId")
        .in("ingredientId", ingredientIds);

      if (giError) throw giError;
      const checks = (giData ?? []) as GroceryIngredientRow[];

      const checkByIngredientId = new Map<number, GroceryIngredientRow>();
      for (const c of checks) checkByIngredientId.set(c.ingredientId, c);

      const built: BuyItem[] = ingredients
        .map((ing) => {
          const total = totalsByIngredientId.get(ing.id) ?? 0;
          const chk = checkByIngredientId.get(ing.id);

          return {
            ingredientId: ing.id,
            name: ing.name,
            unit: ing.unit,
            zoneId: ing.zoneId,
            zoneName: ing.zone?.name ?? "Autres",
            total,
            checked: chk?.checked ?? false,
            groceryIngredientId: chk?.id,
          } as BuyItem;
        })
        .filter((x) => x.total > 0);

      built.sort((a, b) => {
        if (a.zoneName !== b.zoneName) return a.zoneName.localeCompare(b.zoneName);
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.name.localeCompare(b.name);
      });

      setItems(built);
    } catch (e: any) {
      console.log("BUYING LOAD ERROR", e);
      Alert.alert("Error", e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleCheck = async (ingredientId: number) => {
    setItems((prev) =>
      prev.map((it) => (it.ingredientId === ingredientId ? { ...it, checked: !it.checked } : it)),
    );

    try {
      const userId = await getUserId();
      const current = items.find((x) => x.ingredientId === ingredientId);
      const nextValue = !(current?.checked ?? false);

      if (current?.groceryIngredientId) {
        const { error } = await supabase
          .from("GroceryIngredient")
          .update({ check: nextValue })
          .eq("id", current.groceryIngredientId);

        if (error) throw error;
        return;
      }

      const { data: inserted, error: upsertError } = await supabase
        .from("GroceryIngredient")
        .upsert({ ingredientId, userId, check: nextValue }, { onConflict: "userId,ingredientId" })
        .select("id,ingredientId,check")
        .single();

      if (!upsertError && inserted?.id) {
        setItems((prev) =>
          prev.map((it) =>
            it.ingredientId === ingredientId ? { ...it, groceryIngredientId: inserted.id } : it,
          ),
        );
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("GroceryIngredient")
        .insert({ ingredientId, userId, check: nextValue })
        .select("id")
        .single();

      if (createError) throw createError;

      setItems((prev) =>
        prev.map((it) =>
          it.ingredientId === ingredientId ? { ...it, groceryIngredientId: created?.id } : it,
        ),
      );
    } catch (e: any) {
      console.log("TOGGLE CHECK ERROR", e);
      Alert.alert("Error", e?.message || "Update failed");

      setItems((prev) =>
        prev.map((it) => (it.ingredientId === ingredientId ? { ...it, checked: !it.checked } : it)),
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.section, { paddingBottom: theme.spacing.xl * 3 }]}>
        <View style={styles.rowBetween}>
          <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Courses</Text>
          <Button title="Rafraîchir" onPress={loadAll} loading={loading}/>
        </View>
        {grouped.map((section) => (
          <Card key={section.zoneName} variant="outlined" padding="md" style={styles.section}>
            <List header={section.zoneName} columns={[20, "flex", 70]}>
            {section.items.map((item) => (
              <ListItem key={item.ingredientId}>
                <Checkbox checked={item.checked} onPress={() => toggleCheck(item.ingredientId)}/>
                <ListItemText>{item.name}</ListItemText>
                <ListItemText style={{alignSelf: "center"}}>{item.total} {item.unit}</ListItemText>
              </ListItem>
            ))}
            </List>
          </Card>
        ))}
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