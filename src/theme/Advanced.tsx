import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "./ThemeProvider";

// SWITCH / TOGGLE
interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({ value, onValueChange, label, disabled = false, style }: SwitchProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.switchContainer, style]}>
      <Pressable
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        style={[
          styles.switchTrack,
          {
            backgroundColor: value ? theme.colors.accent : theme.colors.bgInput,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.full,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            {
              backgroundColor: value ? theme.colors.accentContrast : theme.colors.textMuted,
              transform: [{ translateX: value ? 20 : 0 }],
              borderRadius: theme.radius.full,
            },
          ]}
        />
      </Pressable>

      {label && (
        <Text
          style={[
            styles.switchLabel,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.base,
              fontFamily: theme.fontFamily.mono.sm,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

// RADIO GROUP
interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function RadioGroup({
  options,
  value,
  onChange,
  label,
  disabled = false,
  style,
}: RadioGroupProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.radioGroup, style]}>
      {label && (
        <Text
          style={[
            styles.radioGroupLabel,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.mono.sm,
              fontWeight: theme.fontWeight.semibold,
              marginBottom: 8,
            },
          ]}
        >
          {label}
        </Text>
      )}

      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            disabled={disabled}
            style={[styles.radioOption, { opacity: disabled ? 0.5 : 1 }]}
          >
            <View
              style={[
                styles.radioCircle,
                {
                  borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                  borderWidth: theme.borderWidth.default,
                  borderRadius: theme.radius.full,
                },
              ]}
            >
              {isSelected && (
                <View
                  style={[
                    styles.radioInner,
                    {
                      backgroundColor: theme.colors.accent,
                      borderRadius: theme.radius.full,
                    },
                  ]}
                />
              )}
            </View>

            <Text
              style={[
                styles.radioLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.base,
                  fontFamily: theme.fontFamily.mono.sm,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// SLIDER
interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  disabled = false,
  style,
}: SliderProps) {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (locationX: number) => {
    if (disabled || trackWidth === 0) return;

    const newValue = min + (locationX / trackWidth) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    if (!Number.isNaN(clampedValue)) {
      onValueChange(clampedValue);
    }
  };

  return (
    <View style={[styles.sliderContainer, style]}>
      {label && (
        <View style={styles.sliderHeader}>
          <Text
            style={[
              styles.sliderLabel,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.sm,
                fontFamily: theme.fontFamily.mono.sm,
                fontWeight: theme.fontWeight.semibold,
              },
            ]}
          >
            {label}
          </Text>
          {showValue && (
            <Text
              style={[
                styles.sliderValue,
                {
                  color: theme.colors.accent,
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.fontFamily.mono.md,
                },
              ]}
            >
              {value}
            </Text>
          )}
        </View>
      )}

      <View
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={(event) => {
          setIsDragging(true);
          const locationX = event.nativeEvent.locationX;
          updateValue(locationX);
        }}
        onResponderMove={(event) => {
          const locationX = event.nativeEvent.locationX;
          updateValue(locationX);
        }}
        onResponderRelease={() => {
          setIsDragging(false);
        }}
        onLayout={(event) => {
          setTrackWidth(event.nativeEvent.layout.width);
        }}
        style={[
          styles.sliderTrack,
          {
            backgroundColor: theme.colors.bgInput,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.none,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.sliderFill,
            {
              width: `${percentage}%`,
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.none,
            },
          ]}
        />

        <View
          style={[
            styles.sliderThumb,
            {
              left: `${percentage}%`,
              backgroundColor: theme.colors.accentContrast,
              borderColor: theme.colors.accent,
              borderWidth: theme.borderWidth.thick,
              borderRadius: theme.radius.none,
              transform: isDragging ? [{ scale: 1.1 }] : [{ scale: 1 }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Switch
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchTrack: {
    width: 44,
    height: 24,
    padding: 2,
  },
  switchThumb: {
    width: 18,
    height: 18,
  },
  switchLabel: {},

  // Radio
  radioGroup: {
    width: "100%",
  },
  radioGroupLabel: {},
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
  },
  radioLabel: {},

  // Slider
  sliderContainer: {
    width: "100%",
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sliderLabel: {},
  sliderValue: {},
  sliderTrack: {
    height: 8,
    width: "100%",
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 16,
    height: 16,
    position: "absolute",
    top: -4,
    marginLeft: -8,
  },
});
