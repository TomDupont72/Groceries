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
  max = 6,
  style,
}: {
  dict: Dict;
  value: string;
  onChange?: (v: string) => void;
  onPick?: (it: ComboItem) => void;
  placeholder?: string;
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
        <View style={[styles.list, { top: inputH + 6 }]}>
          <ScrollView
            style={{ maxHeight: 240 }}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
          >
            {filtered.map((item, index) => {
              const isActive = index === hover;

              return (
                <Pressable
                  key={item.name}
                  // IMPORTANT : on sélectionne sur PressIn (avant blur/démontage)
                  onPressIn={() => {
                    ignoreBlurRef.current = true;
                    setHover(index);
                    select(item);
                    // on relâche le lock après le tick UI
                    setTimeout(() => {
                      ignoreBlurRef.current = false;
                    }, 0);
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
  input: {
    width: "100%",
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.card,
    color: tokens.colors.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: tokens.typography?.fontSize ?? 14,
    letterSpacing: tokens.typography?.letterSpacing ?? 0.2,
    fontFamily: tokens.typography?.fontFamily,
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
    // hard shadow retro
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 8 },
    overflow: "hidden",
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1f",
  },
  itemActive: {
    backgroundColor: tokens.colors.hover ?? "#101014",
  },
  itemMain: {
    color: tokens.colors.text,
    fontFamily: tokens.typography?.fontFamilyStrong ?? tokens.typography?.fontFamily,
    fontSize: 14,
  },
  itemSub: {
    color: tokens.colors.text,
    opacity: 0.9,
    fontSize: 13,
    fontFamily: tokens.typography?.fontFamily,
  },
});
