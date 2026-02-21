import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "./ThemeProvider";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export function Badge({ children, variant = "default", size = "md", style }: BadgeProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      fontSize: theme.fontSize.xs,
    },
    md: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: theme.fontSize.sm,
    },
    lg: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: theme.fontSize.base,
    },
  };

  const getVariantStyle = (): { bg: string; text: string } => {
    switch (variant) {
      case "accent":
        return {
          bg: theme.colors.accent,
          text: theme.colors.accentContrast,
        };
      case "success":
        return {
          bg: theme.colors.success,
          text: "#ffffff",
        };
      case "warning":
        return {
          bg: theme.colors.warning,
          text: "#1a1a1a",
        };
      case "error":
        return {
          bg: theme.colors.error,
          text: "#ffffff",
        };
      case "info":
        return {
          bg: theme.colors.info,
          text: "#ffffff",
        };
      case "default":
        return {
          bg: "#000000",
          text: "#ffffff",
        };
    }
  };

  const variantStyle = getVariantStyle();
  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.bg,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: theme.radius.sm,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: variantStyle.text,
            fontFamily: size === "sm" ? theme.fontFamily.mono.sm : theme.fontFamily.mono.md,
            fontWeight: theme.fontWeight.semibold,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  text: {
    textAlign: "center",
  },
  badgeText: {
    textAlign: "center",
  },
});
