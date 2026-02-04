import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  TextInput,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { tokens } from "./tokens";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function RetroButton({
  title,
  onPress,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.hardShadowWrap, style, disabled && { opacity: 0.5 }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.btnText}>{title}</Text>
      </Pressable>
    </View>
  );
}

export function RetroInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  ...props
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
} & TextInputProps) {
  const [show, setShow] = React.useState(false);

  return (
    <View style={styles.inputWrap}>
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
  );
}


const styles = StyleSheet.create({
  hardShadowWrap: {
    backgroundColor: "#000",
    paddingBottom: tokens.shadow.offset,
  },
  card: {
    backgroundColor: tokens.colors.card,
    borderColor: tokens.colors.border,
    borderWidth: tokens.stroke.thin,
    borderRadius: 0,
    padding: tokens.spacing.md,
  },
  btn: {
    backgroundColor: "transparent",
    borderColor: tokens.colors.border,
    borderWidth: tokens.stroke.thin,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  btnPressed: {
    transform: [{ translateY: tokens.shadow.offset }],
  },
  btnText: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamilyStrong,
    letterSpacing: tokens.typography.letterSpacing,
    fontSize: tokens.typography.fontSize,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent", // important
    color: tokens.colors.text,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.bg,
  },
  eye: {
    paddingHorizontal: 10,
  },
  eyeText: {
    color: tokens.colors.text,
    fontSize: 16,
  },
});

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

export function RetroCheckbox({ checked }: { checked: boolean }) {
  return (
    <View style={[ui.checkbox, checked ? ui.checkboxChecked : null]}>
      {checked ? <Text style={ui.checkboxTick}>✓</Text> : null}
    </View>
  );
}

const ui = StyleSheet.create({
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
    backgroundColor: tokens.colors.hover ?? "#101014",
  },
  rowPressed: {
    transform: [{ translateY: 2 }],
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: tokens.colors.border,
  },
  checkboxTick: {
    color: "#000",
    fontFamily: tokens.typography.fontFamilyStrong,
    fontSize: 12,
    lineHeight: 12,
  },
});
