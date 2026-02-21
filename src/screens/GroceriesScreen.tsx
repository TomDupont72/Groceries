import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTheme,
  Card,
  List,
  ListItem,
  ListItemInput,
  ListItemText,
  Checkbox,
  Button,
  Badge,
  Loading,
} from "../theme/index";
import { useGroceries } from "../hooks/useGroceries";
import { styles } from "../theme/theme";

export default function GroceriesScreen() {
  const { theme } = useTheme();
  const {
    loadingAddGrocery,
    loadingPage,
    loadingRefresh,
    errorMsg,
    recipeData,
    selectedRecipes,
    groceryRecipeData,
    toggleRecipe,
    setQuantity,
    submit,
    loadAll,
  } = useGroceries();

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
          Gérer les courses
        </Text>
        <Card variant="outlined" padding="md" style={styles.section}>
          <List header="Recettes" columns={[20, "flex", 60]}>
            {recipeData.map((item) => (
              <ListItem key={item.id}>
                <Checkbox
                  checked={item.id in selectedRecipes}
                  onPress={() => toggleRecipe(item.id)}
                />
                <ListItemText>{item.name}</ListItemText>
                <ListItemInput
                  value={selectedRecipes[item.id]}
                  onChangeText={(txt) => setQuantity(item.id, txt)}
                  placeholder="Qté"
                  keyboardType="numeric"
                  disabled={!(item.id in selectedRecipes)}
                />
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
            title="Ajouter aux courses"
            onPress={submit}
            fullWidth
            loading={loadingAddGrocery}
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
            Mes courses
          </Text>
          <Button title="Rafraîchir" onPress={() => loadAll("refresh")} loading={loadingRefresh} />
        </View>
        <Card variant="outlined" padding="md" style={styles.section}>
          <List header="Courses" columns={["flex", 70]} columnHeaders={["Recette", "Quantité"]}>
            {groceryRecipeData.map((item) => (
              <ListItem key={item.recipeId}>
                <ListItemText>{item.recipe.name}</ListItemText>
                <ListItemText style={{ alignSelf: "center" }}>{item.quantity ?? "-"}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
