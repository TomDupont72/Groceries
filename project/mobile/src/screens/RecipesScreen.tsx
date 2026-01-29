import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { tokens } from "../theme/tokens";
import { Card } from "../theme/components";

export default function RecipesScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Recipes</Text>
      <Card>
        <Text style={styles.text}>Next: list recipes + detail + add recipe</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.bg, padding: tokens.spacing.lg, gap: tokens.spacing.lg },
  h1: { color: tokens.colors.text, fontSize: 24, fontWeight: "900" },
  text: { color: tokens.colors.text },
});
