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
import { Card, RetroButton } from "../theme/components";

type GroceryRow = { id: number; userId: string };

type GroceryRecipeRow = {
  id: number;
  groceryId: number;
  recipeId: number;
  quantity: number; // multiplier for recipe
};

type RecipeIngredientRow = {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number; // quantity for ingredient inside recipe
};

type IngredientRow = {
  id: number;
  name: string;
  unit: string | null;
  zoneId: number | null;
  zone?: { name: string } | null; // embedded join
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
  total: number; // computed required quantity
  checked: boolean;
  groceryIngredientId?: number; // for update
};

export default function BuyingScreen() {
  const [loading, setLoading] = useState(false);

  const [groceryId, setGroceryId] = useState<number | null>(null);
  const [items, setItems] = useState<BuyItem[]>([]);

  // Group by zone name
  const grouped = useMemo(() => {
    const map = new Map<string, BuyItem[]>();
    for (const it of items) {
      const key = it.zoneName || "Autres";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    // sort items in each zone (unchecked first, then name)
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
      map.set(k, arr);
    }
    // sort zones alphabetically, but put "Other" last
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
    const { data: { user }, error } = await supabase.auth.getUser();
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

      // 1) GroceryRecipe (recipes in grocery)
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

      // 2) RecipeIngredient for these recipeIds
      const recipeIds = groceryRecipes.map((r) => r.recipeId);

      const { data: riData, error: riError } = await supabase
        .from("RecipeIngredient")
        .select("id,recipeId,ingredientId,quantity")
        .in("recipeId", recipeIds);

      if (riError) throw riError;
      const recipeIngredients = (riData ?? []) as RecipeIngredientRow[];

      // 3) Compute totals per ingredient
      const recipeMultiplier = new Map<number, number>(); // recipeId -> qty in grocery
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

      // 4) Fetch Ingredient + Zone name (embedded)
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
        zone: Array.isArray(i.zone) ? (i.zone[0] ?? null) : (i.zone ?? null), // ✅ objet { name }
      }));

      const ingredients = mappedIngredients;


      // 5) Fetch GroceryIngredient checks for these ingredientIds
      const { data: giData, error: giError } = await supabase
        .from("GroceryIngredient")
        .select("id,ingredientId,check,userId")
        .in("ingredientId", ingredientIds);

      if (giError) throw giError;
      const checks = (giData ?? []) as GroceryIngredientRow[];

      const checkByIngredientId = new Map<number, GroceryIngredientRow>();
      for (const c of checks) checkByIngredientId.set(c.ingredientId, c);

      // 6) Build final list
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
        // Keep only ingredients we actually need (>0)
        .filter((x) => x.total > 0);

      // Sort globally by zone then name
      built.sort((a, b) => {
        if (a.zoneName !== b.zoneName) return a.zoneName.localeCompare(b.zoneName);
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.name.localeCompare(b.name);
      });

      setItems(built);
    } catch (e: any) {
      console.log("BUYING LOAD ERROR", e);
      Alert.alert("Error", e?.message || e?.details || e?.hint || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleCheck = async (ingredientId: number) => {
    // optimistic UI
    setItems((prev) =>
      prev.map((it) =>
        it.ingredientId === ingredientId ? { ...it, checked: !it.checked } : it
      )
    );

    try {
      const userId = await getUserId();
      const current = items.find((x) => x.ingredientId === ingredientId);
      const nextValue = !(current?.checked ?? false);

      // If we already have a GroceryIngredient row => update
      if (current?.groceryIngredientId) {
        const { error } = await supabase
          .from("GroceryIngredient")
          .update({ check: nextValue })
          .eq("id", current.groceryIngredientId);

        if (error) throw error;
        return;
      }

      // Else try upsert by (userId, ingredientId) if you have a unique constraint
      // If you don't have it, this may error; we catch and fallback.
      const { data: inserted, error: upsertError } = await supabase
        .from("GroceryIngredient")
        .upsert(
          { ingredientId, userId, check: nextValue },
          // requires UNIQUE(userId, ingredientId) to be deterministic
          { onConflict: "userId,ingredientId" }
        )
        .select("id,ingredientId,check")
        .single();

      if (!upsertError && inserted?.id) {
        // update local with the created id
        setItems((prev) =>
          prev.map((it) =>
            it.ingredientId === ingredientId
              ? { ...it, groceryIngredientId: inserted.id }
              : it
          )
        );
        return;
      }

      // Fallback if onConflict is not available in your schema:
      // try insert
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
      Alert.alert("Error", e?.message || e?.details || e?.hint || "Update failed");

      // revert optimistic UI on error
      setItems((prev) =>
        prev.map((it) =>
          it.ingredientId === ingredientId ? { ...it, checked: !it.checked } : it
        )
      );
    }
  };

  const formatQty = (qty: number) => {
    // You can tweak: integer display vs decimals
    if (Number.isInteger(qty)) return String(qty);
    return qty.toFixed(2);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ gap: tokens.spacing.lg }}>
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
                <TouchableOpacity
                  key={String(it.ingredientId)}
                  activeOpacity={0.8}
                  onPress={() => toggleCheck(it.ingredientId)}
                  style={[
                    styles.itemRow,
                    it.checked ? styles.itemRowChecked : null,
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>
                      {it.checked ? "✅ " : "⬜ "} {it.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      Quantité: {formatQty(it.total)}{it.unit ? ` ${it.unit}` : ""}
                    </Text>
                  </View>

                  <Text style={styles.itemMetaRight}>
                    {it.checked ? "OK" : ""}
                  </Text>
                </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
  muted: {
    color: tokens.colors.text,
    opacity: 0.7,
  },

  zoneTitle: {
    color: tokens.colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  itemRow: {
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
  itemRowChecked: {
    borderColor: "rgba(255,255,255,0.35)",
    opacity: 0.8,
  },
  itemLeft: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    color: tokens.colors.text,
    fontWeight: "900",
  },
  itemMeta: {
    color: tokens.colors.text,
    opacity: 0.75,
    fontSize: 12,
  },
  itemMetaRight: {
    color: tokens.colors.text,
    opacity: 0.7,
    fontWeight: "900",
  },
});
