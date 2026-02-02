import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { tokens } from "./tokens";

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing.md,
  },
});
