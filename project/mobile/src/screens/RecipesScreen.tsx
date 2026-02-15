import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTheme,
  Card,
  Input,
  List,
  ListItem,
  ListItemInput,
  ListItemText,
  Checkbox,
  Button,
  Badge,
  Loading,
} from "../theme/index";
import { useRecipes } from "../hooks/useRecipes";

export default function RecipesScreen() {
  const {
    loadingPage,
    loadingRefresh,
    loadingAddRecipe,
    ingredientData,
    selectedIngredients,
    setQuantity,
    toggleIngredient,
    submit,
    loadAll,
    recipeData,
    errorMsg,
  } = useRecipes();
  const { theme } = useTheme();
  const [recipeName, setRecipeName] = useState("");

  if (loadingPage) return <Loading />;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.section, { paddingBottom: theme.spacing.xl * 3 }]}>
        <Text
          style={{
            color: theme.colors.text,
            fontFamily: theme.fontFamily.mono.md,
            fontSize: theme.fontSize.xxl,
          }}
        >
          Gérer les recettes
        </Text>
        <Card variant="outlined" padding="md" style={styles.section}>
          <Input
            label="Nom de la recette"
            value={recipeName}
            onChangeText={setRecipeName}
            containerStyle={{ marginBottom: theme.spacing.md }}
          />
          <List header="Ingredients" columns={[20, "flex", 60, 65]}>
            {ingredientData.map((item) => (
              <ListItem key={item.id}>
                <Checkbox
                  checked={item.id in selectedIngredients}
                  onPress={() => toggleIngredient(item.id)}
                />
                <ListItemText>{item.name}</ListItemText>
                <ListItemInput
                  value={selectedIngredients[item.id]}
                  onChangeText={(txt) => setQuantity(item.id, txt)}
                  placeholder="Qté"
                  keyboardType="numeric"
                  disabled={!(item.id in selectedIngredients)}
                />
                <ListItemText variant="muted">{item.unit}</ListItemText>
              </ListItem>
            ))}
          </List>
          {errorMsg ? (
            <View style={styles.errorRow}>
              <Badge variant="error" style={{ alignSelf: "center" }}>
                Erreur
              </Badge>
              <Text
                style={[
                  styles.errorText,
                  {
                    flex: 1,
                    color: theme.colors.text,
                    fontFamily: theme.fontFamily.mono.md,
                    fontSize: theme.fontSize.md,
                  },
                ]}
              >
                {errorMsg}
              </Text>
            </View>
          ) : null}
          <Button
            title="Ajouter une recette"
            onPress={() => submit(recipeName)}
            fullWidth
            loading={loadingAddRecipe}
          />
        </Card>
        <View style={styles.rowBetween}>
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.md,
              fontSize: theme.fontSize.xxl,
            }}
          >
            Mes recettes
          </Text>
          <Button title="Rafraîchir" onPress={() => loadAll("refresh")} loading={loadingRefresh} />
        </View>
        <Card variant="outlined" padding="md" style={styles.section}>
          <List header="Recettes" columns={["flex"]}>
            {recipeData.map((item) => (
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  errorText: {
    flex: 1,
    flexWrap: "wrap",
  },
});
