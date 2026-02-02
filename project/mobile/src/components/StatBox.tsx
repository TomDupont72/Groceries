import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { tokens } from "../theme/tokens";

export default function StatBox({
  label,
  value,
  style,
}: {
  label: string;
  value: string | number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.panel, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.card,
    padding: tokens.spacing.md,
  },
  label: {
    fontSize: 12,
    color: tokens.colors.muted,
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    color: tokens.colors.text,
  },
});
