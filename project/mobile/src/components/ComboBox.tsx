import React, { useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import { tokens } from "../theme/tokens";

type Dict = { [key: string]: string };
type ComboItem = { name: string; cat: string };

export default function ComboBox({
  dict,
  value,
  onChange,
  onPick,
  placeholder = "Nom",
  label,
  max = 6,
  style,
}: {
  dict: Dict;
  value: string;
  onChange?: (v: string) => void;
  onPick?: (it: ComboItem) => void;
  placeholder?: string;
  label?: string;
  max?: number;
  style?: ViewStyle;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(-1);
  const [inputH, setInputH] = useState(0);

  const inputRef = useRef<TextInput>(null);

  // clé du fix : on ignore le blur tant qu'on est en train de sélectionner
  const ignoreBlurRef = useRef(false);

  const items = useMemo<ComboItem[]>(
    () => Object.entries(dict).map(([name, cat]) => ({ name, cat })),
    [dict],
  );

  const filtered = useMemo(() => {
    const q = (value || "").toLowerCase().trim();
    if (!q) return items.slice(0, max);

    const starts = items.filter((it) => it.name.toLowerCase().startsWith(q)).slice(0, max);
    if (starts.length) return starts;

    return items.filter((it) => it.name.toLowerCase().includes(q)).slice(0, max);
  }, [items, value, max]);

  function select(it: ComboItem) {
    // met à jour le champ
    onChange?.(it.name);
    onPick?.(it);

    // ferme la liste
    setOpen(false);
    setHover(-1);

    // on garde le focus => clavier stable
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function onInputLayout(e: LayoutChangeEvent) {
    setInputH(e.nativeEvent.layout.height);
  }

  return (
    <View style={[styles.comboWrap, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.muted}
        onLayout={onInputLayout}
        onChangeText={(t) => {
          onChange?.(t);
          setOpen(true);
          setHover(-1);
        }}
        onFocus={() => {
          setOpen(true);
          setHover(-1);
        }}
        onBlur={() => {
          // si un item est en cours de tap => on ignore ce blur
          if (ignoreBlurRef.current) return;

          // sinon on ferme
          setOpen(false);
          setHover(-1);
        }}
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.input}
      />

      {open && filtered.length > 0 && (
        <View style={[styles.list, { top: inputH + (label ? 30 : 6) }]}>
          <ScrollView
            style={{ maxHeight: 240 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            scrollEnabled={filtered.length > 4}
          >
            {filtered.map((item, index) => {
              const isActive = index === hover;

              return (
                <Pressable
                  key={item.name}
                  onPress={() => {
                    ignoreBlurRef.current = true;
                    setHover(index);
                    select(item);
                    setTimeout(() => {
                      ignoreBlurRef.current = false;
                    }, 100);
                  }}
                  onPressIn={() => {
                    ignoreBlurRef.current = true;
                  }}
                  style={[styles.item, isActive && styles.itemActive]}
                >
                  <Text style={styles.itemMain}>{item.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  comboWrap: {
    width: "100%",
    position: "relative",
  },
  label: {
    fontFamily: tokens.typography.fontFamilyStrong,
    fontSize: tokens.typography.small,
    color: tokens.colors.text,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.card,
    color: tokens.colors.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: tokens.typography.fontSize,
    letterSpacing: tokens.typography.letterSpacing,
    fontFamily: tokens.typography.fontFamily,
    borderRadius: 0,
  },
  list: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 20,
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.card,
    // hard shadow retro (keeping it!)
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: tokens.shadow.offset },
    overflow: "hidden",
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderSubtle,
  },
  itemActive: {
    backgroundColor: tokens.colors.hover,
    borderLeftWidth: 2,
    borderLeftColor: tokens.colors.accent,
  },
  itemMain: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.fontFamilyStrong,
    fontSize: 14,
    letterSpacing: tokens.typography.letterSpacing,
  },
});