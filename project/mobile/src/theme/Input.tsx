import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Pressable,
} from "react-native";
import { useTheme } from "./ThemeProvider";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerStyle,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontFamily:theme.fontFamily.mono.sm,
              fontWeight: theme.fontWeight.semibold,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.bgInput,
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.none,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...props}
          secureTextEntry={secureTextEntry && !showPassword}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontFamily:theme.fontFamily.mono.sm,
            },
          ]}
          placeholderTextColor={theme.colors.textMuted}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Text style={{ fontSize: 18 }}>
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </Text>
          </Pressable>
        )}

        {!secureTextEntry && rightIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && (
        <Text
          style={[
            styles.helperText,
            { color: theme.colors.error, fontFamily:theme.fontFamily.mono.sm },
          ]}
        >
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text
          style={[
            styles.helperText,
            { color: theme.colors.textMuted, fontFamily:theme.fontFamily.mono.sm },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  containerStyle,
  ...props
}: Omit<InputProps, "leftIcon" | "rightIcon" | "secureTextEntry">) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontFamily:theme.fontFamily.mono.sm,
              fontWeight: theme.fontWeight.semibold,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        multiline
        textAlignVertical="top"
        style={[
          styles.textarea,
          {
            backgroundColor: theme.colors.bgInput,
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.none,
            color: theme.colors.text,
            fontFamily:theme.fontFamily.mono.sm,
          },
        ]}
        placeholderTextColor={theme.colors.textMuted}
      />

      {error && (
        <Text
          style={[
            styles.helperText,
            { color: theme.colors.error, fontFamily:theme.fontFamily.mono.sm },
          ]}
        >
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text
          style={[
            styles.helperText,
            { color: theme.colors.textMuted, fontFamily:theme.fontFamily.mono.sm },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textarea: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  helperText: {
    marginTop: 4,
  },
});