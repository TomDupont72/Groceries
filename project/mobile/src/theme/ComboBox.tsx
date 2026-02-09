import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { useTheme } from "./ThemeProvider";

type ComboItem = { label: string; value: string };

interface ComboBoxProps {
  label?: string;
  value: string; // texte affiché / saisi
  onChange: (value: string) => void;
  onSelectItem?: (item: ComboItem) => void;
  options: ComboItem[];
  placeholder?: string;
  max?: number;
  containerStyle?: ViewStyle;
}

export function ComboBox({
  label,
  value,
  onChange,
  onSelectItem,
  options,
  placeholder = "Appuyez pour sélectionner...",
  max = 6,
  containerStyle,
}: ComboBoxProps) {
  const { theme } = useTheme();

  const inputRef = useRef<TextInput>(null);
  const ignoreBlurRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(-1);

  const [inputH, setInputH] = useState(0);

  const offset = theme.shadow.offset;
  const frameBorder = theme.colors.border;
  const shadowColor = theme.colors.shadow; // idéalement noir constant

  const filtered = useMemo(() => {
    const q = (value || "").toLowerCase().trim();
    if (!q) return options.slice(0, max);

    const starts = options
      .filter((it) => it.label.toLowerCase().startsWith(q))
      .slice(0, max);

    if (starts.length) return starts;

    return options
      .filter((it) => it.label.toLowerCase().includes(q))
      .slice(0, max);
  }, [options, value, max]);

  function select(item: ComboItem) {
    onChange(item.label);
    onSelectItem?.(item);

    setOpen(false);
    setHover(-1);

    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function onInputLayout(e: LayoutChangeEvent) {
    setInputH(e.nativeEvent.layout.height);
  }

  const dropdownTop = inputH + theme.spacing.xl; // ✅ stable sous l’input

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.mono.sm,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        onLayout={onInputLayout}
        onChangeText={(t) => {
          onChange(t);
          setOpen(true);
          setHover(-1);
        }}
        onFocus={() => {
          setOpen(true);
          setHover(-1);
        }}
        onBlur={() => {
          if (ignoreBlurRef.current) return;
          setOpen(false);
          setHover(-1);
        }}
        autoCorrect={false}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            borderWidth: theme.borderWidth.default,
            borderColor: frameBorder,
            backgroundColor: theme.colors.bgInput,
            color: theme.colors.text,
            fontSize: theme.fontSize.base,
            fontFamily: theme.fontFamily.mono.sm,
            borderRadius: theme.radius.none,
          },
        ]}
      />

      {open && filtered.length > 0 && (
        <View
          style={[
            styles.dropdownFrame,
            {
              top: dropdownTop,
              borderWidth: theme.borderWidth.default,
              borderColor: frameBorder,
              borderRadius: theme.radius.none,
              backgroundColor: theme.colors.bgCard,
            },
          ]}
        >
          {/* ✅ Ombre dure derrière : fond + bordure = shadow */}
          <View
            pointerEvents="none"
            style={[
              RNStyleSheet.absoluteFillObject,
              {
                backgroundColor: shadowColor,
                borderColor: shadowColor,
                borderWidth: theme.borderWidth.default,
                borderRadius: theme.radius.none,
                transform: [{ translateX: offset }, { translateY: offset }],
                zIndex: -1,
              },
            ]}
          />

          {/* ✅ Inner : on “colle” le contenu au cadre (anti hairline gap Android) */}
          <View
            style={[
              styles.dropdownInner,
              {
                marginTop: -theme.borderWidth.default, // 👈 supprime la micro-bande
              },
            ]}
          >
            <ScrollView
              style={{ maxHeight: 240 }}
              contentContainerStyle={{ paddingVertical: 0 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              scrollEnabled={filtered.length > 4}
            >
              {filtered.map((item, index) => {
                const isActive = index === hover;

                return (
                  <Pressable
                    key={item.value}
                    onPressIn={() => {
                      ignoreBlurRef.current = true;
                      setHover(index);
                    }}
                    onPressOut={() => {
                      setTimeout(() => {
                        ignoreBlurRef.current = false;
                        setHover(-1);
                      }, 120);
                    }}
                    onPress={() => select(item)}
                    style={[
                      styles.item,
                      {
                        // ✅ pas de trait au-dessus du premier item
                        borderTopWidth: index === 0 ? 0 : 1,
                        borderTopColor: theme.colors.borderLight,

                        // ✅ IMPORTANT : pas transparent -> évite la bande visible
                        backgroundColor: isActive
                          ? theme.colors.bgHover
                          : theme.colors.bgCard,
                      },
                      isActive && {
                        borderLeftWidth: theme.borderWidth.thick,
                        borderLeftColor: theme.colors.accent,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontFamily: theme.fontFamily.mono.sm,
                        fontSize: theme.fontSize.sm,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    position: "relative",
  },
  label: {},
  input: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dropdownFrame: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 30,
  },

  dropdownInner: {
    width: "100%",
  },

  item: {
    paddingVertical: 10,
    paddingHorizontal: 12, // ✅ aligné avec l’input
    flexDirection: "row",
    alignItems: "center",
  },
});
