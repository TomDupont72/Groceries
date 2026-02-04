import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";

import { supabase } from "../api/supabase";
import { tokens } from "../theme/tokens";
import { Card, RetroButton, RetroRow, RetroCheckbox } from "../theme/components";

type GroceryRow = { id: number; userId: string };

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
  check: boolean;
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
  const [loading, setLoading] = useState(false);

  const [groceryId, setGroceryId] = useState<number | null>(null);
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

  const loadAll = async () => {
    try {
      setLoading(true);

      const userId = await getUserId();
      const gid = await getOrCreateGroceryId(userId);
      setGroceryId(gid);

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
          (totalsByIngredientId.get(ri.ingredientId) ?? 0) + add
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
        .select("id,ingredientId,check,userId")
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
            checked: chk?.check ?? false,
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
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleCheck = async (ingredientId: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.ingredientId === ingredientId ? { ...it, checked: !it.checked } : it
      )
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
            it.ingredientId === ingredientId
              ? { ...it, groceryIngredientId: inserted.id }
              : it
          )
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
          it.ingredientId === ingredientId
            ? { ...it, groceryIngredientId: created?.id }
            : it
        )
      );
    } catch (e: any) {
      console.log("TOGGLE CHECK ERROR", e);
      Alert.alert("Error", e?.message || "Update failed");

      setItems((prev) =>
        prev.map((it) =>
          it.ingredientId === ingredientId ? { ...it, checked: !it.checked } : it
        )
      );
    }
  };

  const formatQty = (qty: number) => {
    if (Number.isInteger(qty)) return String(qty);
    return qty.toFixed(2);
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl * 3, paddingTop: tokens.spacing.xl }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Text style={styles.h1}>Courses</Text>
        <RetroButton title={loading ? "..." : "Rafraîchir"} onPress={loadAll} />
      </View>

      {items.length === 0 ? (
        <Card>
          <Text style={styles.muted}>
            Rien à acheter. Ajouter des recettes à vos courses d'abord.
          </Text>
        </Card>
      ) : (
        grouped.map((section) => (
          <Card key={section.zoneName} style={{ gap: tokens.spacing.sm }}>
            <Text style={styles.zoneTitle}>{section.zoneName}</Text>

            <View style={{ gap: tokens.spacing.xs }}>
              {section.items.map((it) => (
                <RetroRow
                  key={String(it.ingredientId)}
                  selected={it.checked}
                  onPress={() => toggleCheck(it.ingredientId)}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.itemTitleRow}>
                      <RetroCheckbox checked={it.checked} />
                      <Text style={styles.itemName}>{it.name}</Text>
                    </View>

                    <Text style={styles.itemMeta}>
                      Quantité: {formatQty(it.total)}
                      {it.unit ? ` ${it.unit}` : ""}
                    </Text>
                  </View>

                  <Text style={styles.itemMetaRight}>{it.checked ? "OK" : ""}</Text>
                </RetroRow>
              ))}
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  h1: {
    color: tokens.colors.text,
    fontSize: tokens.typography.h1,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
  },

  muted: {
    color: tokens.colors.muted,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
  },

  zoneTitle: {
    color: tokens.colors.text,
    fontSize: tokens.typography.h2,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
  },

  itemLeft: {
    flex: 1,
    gap: 6,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemName: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: tokens.typography.fontSize,
  },
  itemMeta: {
    color: tokens.colors.muted,
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: 12,
  },
  itemMetaRight: {
    color: tokens.colors.muted,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: 12,
  },
});
