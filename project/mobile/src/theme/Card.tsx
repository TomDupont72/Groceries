import React from "react";
import { View, ViewStyle, Pressable } from "react-native";
import { useTheme } from "./ThemeProvider";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = "outlined",
  padding = "md",
  onPress,
  style,
}: CardProps) {
  const { theme } = useTheme();

  const paddingValues = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
  };

  const cardStyle = {
    backgroundColor: theme.colors.bgCard,
    borderWidth: variant === "outlined" ? theme.borderWidth.default : 0,
    borderColor: theme.colors.borderCard,
    borderRadius: theme.radius.none, // Slightly rounded for cards
    padding: paddingValues[padding],
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.8 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
