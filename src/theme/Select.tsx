import React, { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "./ThemeProvider";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  disabled = false,
  containerStyle,
}: SelectProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.sm,
              fontWeight: theme.fontWeight.semibold,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.colors.bgInput,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.md,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            {
              color: selectedOption ? theme.colors.text : theme.colors.textMuted,
              fontFamily: theme.fontFamily.mono.sm,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.bgCard,
                borderColor: theme.colors.border,
                borderWidth: theme.borderWidth.default,
                borderRadius: theme.radius.lg,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView style={styles.optionsList}>
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: pressed
                          ? theme.colors.bgHover
                          : isSelected
                            ? theme.colors.bgHover
                            : "transparent",
                        borderBottomColor: theme.colors.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? theme.colors.accent : theme.colors.text,
                          fontFamily: theme.fontFamily.mono.sm,
                          fontWeight: isSelected
                            ? theme.fontWeight.semibold
                            : theme.fontWeight.normal,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Text
                        style={{
                          color: theme.colors.accent,
                          fontFamily: theme.fontFamily.mono.sm,
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  triggerText: {
    flex: 1,
  },
  arrow: {
    fontSize: 10,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: 400,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionText: {},
});
