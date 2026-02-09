import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { useFonts, DMMono_400Regular, DMMono_500Medium } from "@expo-google-fonts/dm-mono";
import { ThemeProvider } from "./src/theme";


export default function App() {
  const [fontsLoaded] = useFonts({
    DMMono_400Regular,
    DMMono_500Medium,
  });

  if (!fontsLoaded) {
    return null; // ou un loader simple
  }

  return (
    <ThemeProvider initialMode="dark" initialAccent="purple">
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
    </ThemeProvider>
  );
}
