import React from "react";
import { StyleSheet, View, ViewStyle, ScrollView } from "react-native";
import { tokens } from "./tokens";

export function Screen({ 
  children, 
  style,
  scrollable = false,
}: { 
  children: React.ReactNode; 
  style?: ViewStyle;
  scrollable?: boolean;
}) {
  if (scrollable) {
    return (
      <ScrollView 
        style={[styles.screen, style]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
  },
});