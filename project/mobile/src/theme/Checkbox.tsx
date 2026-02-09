import React from "react";
import { Pressable, View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "./ThemeProvider";

interface CheckboxProps {
  checked: boolean;
  onPress?: () => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Checkbox({
  checked,
  onPress,
  label,
  disabled = false,
  style,
}: CheckboxProps) {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.checkboxContainer, style]}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: theme.colors.border,
            backgroundColor: checked ? theme.colors.accent : "transparent",
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.none,
          },
        ]}
      >
        {checked && (
          <Text
            style={[
              styles.checkmark,
              { color: theme.colors.accentContrast },
            ]}
          >
            ✓
          </Text>
        )}
      </View>

      {label && (
        <Text
          style={[
            styles.checkboxLabel,
            {
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.sm,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  badge: {
    alignSelf: "flex-start",
  },
  badgeText: {
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "700",
    transform: [{ translateY: -2 }],
  },
  checkboxLabel: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});