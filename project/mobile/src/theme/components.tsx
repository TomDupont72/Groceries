import React from "react";
import { Pressable, Text, View, StyleSheet, TextInput, ViewStyle } from "react-native";
import { tokens } from "./tokens";

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function RetroButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );
}

export function RetroInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={tokens.colors.muted}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.card,
    borderColor: tokens.colors.border,
    borderWidth: tokens.stroke.thick,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    // hard shadow "lego"
    shadowColor: tokens.colors.border,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: tokens.shadow.offset, height: tokens.shadow.offset },
  },
  btn: {
    backgroundColor: tokens.colors.accent,
    borderColor: tokens.colors.border,
    borderWidth: tokens.stroke.thick,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    shadowColor: tokens.colors.border,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: tokens.shadow.offset, height: tokens.shadow.offset },
  },
  btnPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: tokens.shadow.offset - 2, height: tokens.shadow.offset - 2 },
  },
  btnText: {
    color: "#000",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: tokens.colors.bg,
    color: tokens.colors.text,
    borderColor: tokens.colors.border,
    borderWidth: tokens.stroke.thick,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.sm,
  },
});
