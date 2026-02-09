import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  View,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "./ThemeProvider";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "filled" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "filled",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) {
  const { theme } = useTheme();

  const offset = theme.shadow.offset; // ex: 6

  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fontFamily.mono.sm
    },
    md: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.fontSize.base,
      fontFamily: theme.fontFamily.mono.md
    },
    lg: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      fontSize: theme.fontSize.lg,
      fontFamily: theme.fontFamily.mono.md
    },
  } as const;

  const getVariantStyles = () => {
    if (variant === "filled") {
      return {
        shadowColor: theme.colors.shadow,
        container: {
          backgroundColor: theme.colors.accent,
          borderColor: theme.colors.border,
        },
        text: {
          color: theme.colors.accentContrast,
        },
        showShadow: true,
      };
    }

    if (variant === "outline") {
      return {
        shadowColor: theme.colors.shadow, // léger shadow “ink”
        container: {
          backgroundColor: theme.colors.bgCard,
          borderColor: theme.colors.border,
        },
        text: {
          color: theme.colors.text,
        },
        showShadow: true, // outline a aussi une ombre dans RetroUI souvent
      };
    }

    // ghost
    return {
      shadowColor: "transparent",
      container: {
        backgroundColor: "transparent",
        borderColor: "transparent",
      },
      text: {
        color: theme.colors.text,
      },
      showShadow: false,
    };
  };

  const variantStyles = getVariantStyles();
  const currentSize = sizeStyles[size];

  const isDisabled = disabled || loading;

  return (
    <View
      style={[
        styles.root,
        fullWidth && { width: "100%" },
        style,
        isDisabled && { opacity: 0.5 },
      ]}
    >
      {/* Shadow layer (derrière) */}
      {variantStyles.showShadow && (
        <View
            pointerEvents="none"
            style={[
            StyleSheet.absoluteFillObject,
            {
                backgroundColor: variantStyles.shadowColor,
                transform: [{ translateX: offset }, { translateY: offset }],
                borderWidth: theme.borderWidth.default,
                borderColor: theme.colors.shadow,
                borderRadius: theme.radius.none,
            },
            ]}
        />
        )}


      {/* Button layer (au-dessus) */}
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          variantStyles.container,
          {
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.none,
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          },

          // ✅ effet RetroUI : le bouton “tombe” dans l’ombre
          pressed && !isDisabled && variantStyles.showShadow
            ? { transform: [{ translateX: offset }, { translateY: offset }] }
            : null,

          fullWidth && { width: "100%" },
        ]}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                variant === "filled"
                  ? theme.colors.accentContrast
                  : theme.colors.accent
              }
            />
          ) : (
            <>
              {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
              <Text
                style={[
                  styles.text,
                  variantStyles.text,
                  {
                    fontSize: currentSize.fontSize,
                    fontFamily:
                        size === "sm"
                        ? theme.fontFamily.mono.sm
                        : theme.fontFamily.mono.md,
                  },
                ]}
              >
                {title}
              </Text>
              {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
            </>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    alignSelf: "flex-start", // important pour que la shadow colle à la taille
  },
  shadow: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    textAlign: "center",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
