import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { useFonts, DMMono_400Regular, DMMono_500Medium } from "@expo-google-fonts/dm-mono";

export default function App() {
    const [fontsLoaded] = useFonts({
      DMMono_400Regular,
      DMMono_500Medium,
    });

    if (!fontsLoaded) {
      return null; // ou un loader simple
    }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
