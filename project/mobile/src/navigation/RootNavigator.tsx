import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import AddIngredientScreen from "../screens/AddIngredientScreen";
import GroceriesScreen from "../screens/GroceriesScreen";
import RecipesScreen from "../screens/RecipesScreen";
import BuyingScreen from "../screens/BuyingScreen";
import DemoScreen from "../screens/Demoscreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddIngredient" component={AddIngredientScreen} />
      <Stack.Screen name="Groceries" component={GroceriesScreen} />
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="Buying" component={BuyingScreen} />
      <Stack.Screen name="Demo" component={DemoScreen} />
    </Stack.Navigator>
  );
}
