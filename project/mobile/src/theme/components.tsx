import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  TextInput,
  ViewStyle,
  TextInputProps,
  TextStyle,
} from "react-native";
import { tokens } from "./tokens";

// ============================================================================
// CARD
// ============================================================================
export function Card({ 
  children, 
  style,
  variant = "default",
}: { 
  children: React.ReactNode; 
  style?: ViewStyle;
  variant?: "default" | "accent" | "subtle";
}) {
  const variantStyles = {
    default: { borderColor: tokens.colors.border },
    accent: { borderColor: tokens.colors.accent },
    subtle: { borderColor: tokens.colors.borderSubtle },
  };

  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

// ============================================================================
// RETRO BUTTON (keeping the exact same animation!)
// ============================================================================
export function RetroButton({
  title,
  onPress,
  disabled,
  variant = "primary",
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent" | "outline";
  style?: ViewStyle;
}) {
  const variants = {
    primary: {
      shadow: tokens.colors.bg,
      btn: { 
        backgroundColor: tokens.colors.text,
        borderColor: tokens.colors.border,
      },
      text: { color: tokens.colors.textInverted },
    },
    secondary: {
      shadow: tokens.colors.bg,
      btn: { 
        backgroundColor: tokens.colors.card,
        borderColor: tokens.colors.border,
      },
      text: { color: tokens.colors.text },
    },
    accent: {
      shadow: tokens.colors.accentActive,
      btn: { 
        backgroundColor: tokens.colors.accent,
        borderColor: tokens.colors.accent,
      },
      text: { color: tokens.colors.text },
    },
    outline: {
      shadow: "transparent",
      btn: { 
        backgroundColor: "transparent",
        borderColor: tokens.colors.border,
      },
      text: { color: tokens.colors.text },
    },
  };

  const currentVariant = variants[variant];

  return (
    <View style={[
      styles.hardShadowWrap, 
      { backgroundColor: currentVariant.shadow },
      variant === "outline" && { paddingBottom: 0 },
      style, 
      disabled && { opacity: 0.5 }
    ]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          currentVariant.btn,
          pressed && styles.btnPressed
        ]}
      >
        <Text style={[styles.btnText, currentVariant.text]}>{title}</Text>
      </Pressable>
    </View>
  );
}

// ============================================================================
// RETRO INPUT
// ============================================================================
export function RetroInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  label,
  error,
  state = "default",
  ...props
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  label?: string;
  error?: string;
  state?: "default" | "error" | "success";
} & TextInputProps) {
  const [show, setShow] = React.useState(false);

  const stateStyles = {
    default: { borderColor: tokens.colors.border },
    error: { borderColor: tokens.colors.error },
    success: { borderColor: tokens.colors.success },
  };

  const currentState = error ? "error" : state;

  return (
    <View style={{ width: "100%" }}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputWrap, stateStyles[currentState]]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.muted}
          secureTextEntry={secureTextEntry && !show}
          style={styles.input}
          {...props}
        />

        {secureTextEntry && (
          <Pressable onPress={() => setShow((s) => !s)} style={styles.eye}>
            <Text style={styles.eyeText}>{show ? "🙈" : "👁️"}</Text>
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ============================================================================
// RETRO ROW (keeping the same animation!)
// ============================================================================
export function RetroRow({
  children,
  selected,
  onPress,
  style,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        ui.row,
        selected ? ui.rowSelected : null,
        pressed ? ui.rowPressed : null,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

// ============================================================================
// RETRO CHECKBOX (improved with accent color)
// ============================================================================
export function RetroCheckbox({ 
  checked,
  onPress,
  label,
}: { 
  checked: boolean;
  onPress?: () => void;
  label?: string;
}) {
  const content = (
    <View style={ui.checkboxContainer}>
      <View style={[ui.checkbox, checked ? ui.checkboxChecked : null]}>
        {checked ? <Text style={ui.checkboxTick}>✓</Text> : null}
      </View>
      {label && <Text style={ui.checkboxLabel}>{label}</Text>}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

// ============================================================================
// BADGE (new component!)
// ============================================================================
export function Badge({
  children,
  variant = "default",
  size = "md",
  style,
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md";
  style?: ViewStyle;
}) {
  const variants = {
    default: { 
      bg: tokens.colors.gray700, 
      text: tokens.colors.text,
      border: tokens.colors.gray600,
    },
    accent: { 
      bg: tokens.colors.accent, 
      text: tokens.colors.text,
      border: tokens.colors.accent,
    },
    success: { 
      bg: tokens.colors.success, 
      text: tokens.colors.textInverted,
      border: tokens.colors.success,
    },
    warning: { 
      bg: tokens.colors.warning, 
      text: tokens.colors.textInverted,
      border: tokens.colors.warning,
    },
    error: { 
      bg: tokens.colors.error, 
      text: tokens.colors.text,
      border: tokens.colors.error,
    },
    outline: { 
      bg: "transparent", 
      text: tokens.colors.text,
      border: tokens.colors.border,
    },
  };

  const sizes = {
    sm: { paddingVertical: 2, paddingHorizontal: 8, fontSize: 11 },
    md: { paddingVertical: 4, paddingHorizontal: 10, fontSize: 12 },
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  return (
    <View 
      style={[
        ui.badge,
        { 
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
          ...currentSize,
        },
        style
      ]}
    >
      <Text style={[ui.badgeText, { color: currentVariant.text, fontSize: currentSize.fontSize }]}>
        {children}
      </Text>
    </View>
  );
}

// ============================================================================
// TYPOGRAPHY COMPONENTS
// ============================================================================
export function Heading({
  children,
  level = 2,
  variant = "default",
  style,
}: {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  variant?: "default" | "accent" | "muted";
  style?: TextStyle;
}) {
  const sizes = {
    1: tokens.typography.h1,
    2: tokens.typography.h2,
    3: tokens.typography.h3,
  };

  const variants = {
    default: { color: tokens.colors.text },
    accent: { color: tokens.colors.accent },
    muted: { color: tokens.colors.textMuted },
  };

  return (
    <Text 
      style={[
        ui.heading,
        { fontSize: sizes[level] },
        variants[variant],
        style
      ]}
    >
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  variant = "default",
  size = "base",
  style,
}: {
  children: React.ReactNode;
  variant?: "default" | "muted" | "accent" | "error" | "success";
  size?: "sm" | "base";
  style?: TextStyle;
}) {
  const variants = {
    default: { color: tokens.colors.text },
    muted: { color: tokens.colors.textMuted },
    accent: { color: tokens.colors.accent },
    error: { color: tokens.colors.error },
    success: { color: tokens.colors.success },
  };

  const sizes = {
    sm: tokens.typography.small,
    base: tokens.typography.fontSize,
  };

  return (
    <Text 
      style={[
        ui.bodyText,
        { fontSize: sizes[size] },
        variants[variant],
        style
      ]}
    >
      {children}
    </Text>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Hard Shadow Wrapper (keeping exact animation!)
  hardShadowWrap: {
    paddingBottom: tokens.shadow.offset,
  },
  
  // Card
  card: {
    backgroundColor: tokens.colors.card,
    borderWidth: tokens.stroke.thin,
    borderRadius: 0,
    padding: tokens.spacing.md,
  },
  
  // Button
  btn: {
    borderWidth: tokens.stroke.thin,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  btnPressed: {
    transform: [{ translateY: tokens.shadow.offset }],
  },
  btnText: {
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: tokens.typography.fontSize,
    textAlign: "center",
  },
  
  // Input
  label: {
    fontFamily: tokens.typography.fontFamilyStrong,
    fontSize: tokens.typography.small,
    color: tokens.colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: tokens.stroke.thin,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    color: tokens.colors.text,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize,
    letterSpacing: tokens.typography.letterSpacing,
  },
  eye: {
    paddingHorizontal: 10,
  },
  eyeText: {
    color: tokens.colors.text,
    fontSize: 16,
  },
  errorText: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.small,
    color: tokens.colors.error,
    marginTop: 4,
  },
});

const ui = StyleSheet.create({
  // Row (keeping exact animation!)
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: tokens.colors.card,
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowSelected: {
    backgroundColor: tokens.colors.hover,
    borderColor: tokens.colors.accent,
  },
  rowPressed: {
    transform: [{ translateY: 2 }],
  },
  
  // Checkbox
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: tokens.colors.accent,
    borderColor: tokens.colors.accent,
  },
  checkboxTick: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamilyStrong,
    fontSize: 14,
    lineHeight: 14,
  },
  checkboxLabel: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize,
    color: tokens.colors.text,
  },
  
  // Badge
  badge: {
    borderWidth: tokens.stroke.thin,
    borderRadius: 0,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
  },
  
  // Typography
  heading: {
    fontFamily: tokens.typography.fontFamilyStrong,
  },
  bodyText: {
    fontFamily: tokens.typography.fontFamily,
    letterSpacing: tokens.typography.letterSpacing,
  },
});