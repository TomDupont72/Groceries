import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "./ThemeProvider";
import LottieView from "lottie-react-native";

export function Loading() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.center}>
        <LottieView
          source={
            theme.colors.bg === "#0B0C10"
              ? require("../../assets/loadingWhite.json")
              : require("../../assets/loadingBlack.json")
          }
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 18,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
