import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { tokens } from "./tokens";

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing.md,
  },
});
