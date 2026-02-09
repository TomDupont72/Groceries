import React from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "./ThemeProvider";

// LIST CONTAINER
interface ListProps {
  children: React.ReactNode;
  header?: string | React.ReactNode;
  headerRight?: React.ReactNode;
  columns?: (number | "flex")[]; // [40, "flex", 80, 60] = checkbox, nom, quantité, unité
  columnHeaders?: (string | React.ReactNode)[]; // ["", "Nom", "Qté", "Unité"]
  style?: ViewStyle;
}

export function List({ children, header, headerRight, columns, columnHeaders, style }: ListProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.list, style]}>
      {header && (
        <View
          style={[
            styles.header,
            {
              borderBottomWidth: theme.borderWidth.default,
              borderBottomColor: theme.colors.border,
              paddingBottom: theme.spacing.sm,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {typeof header === "string" ? (
            <Text
              style={[
                styles.headerText,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.fontFamily.mono.md,
                  fontWeight: theme.fontWeight.semibold,
                },
              ]}
            >
              {header}
            </Text>
          ) : (
            header
          )}

          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}

      {/* Column Headers Row */}
      {columnHeaders && columns && (
        <View
          style={[
            styles.columnHeaderRow,
            {
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.borderLight,
              paddingBottom: theme.spacing.xs,
              marginBottom: theme.spacing.xs,
              paddingHorizontal: theme.spacing.md,
            },
          ]}
        >
          {columnHeaders.map((colHeader, index) => {
            const columnWidth = columns[index];
            const columnStyle: ViewStyle =
              columnWidth === "flex" ? { flex: 1 } : { width: columnWidth };

            return (
              <View key={index} style={columnStyle}>
                {typeof colHeader === "string" ? (
                  <Text
                    style={[
                      styles.columnHeaderText,
                      {
                        color: theme.colors.textMuted,
                        fontSize: theme.fontSize.sm,
                        fontFamily: theme.fontFamily.mono.sm,
                        fontWeight: theme.fontWeight.semibold,
                      },
                    ]}
                  >
                    {colHeader}
                  </Text>
                ) : (
                  colHeader
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.listContent}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { columns });
          }
          return child;
        })}
      </View>
    </View>
  );
}

// LIST ITEM
interface ListItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  columns?: (number | "flex")[]; // Passed from List parent
  style?: ViewStyle;
}

export function ListItem({
  children,
  onPress,
  selected = false,
  disabled = false,
  columns,
  style,
}: ListItemProps) {
  const { theme } = useTheme();

  const itemStyle = [
    styles.item,
    {
      backgroundColor: selected ? theme.colors.bgHover : "transparent",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    disabled && { opacity: 0.5 },
    style,
  ];

  // Wrap children with column widths
  const childrenArray = React.Children.toArray(children);
  const wrappedChildren = columns
    ? childrenArray.map((child, index) => {
        const columnWidth = columns[index];
        if (!columnWidth) return child;

        const columnStyle: ViewStyle =
          columnWidth === "flex"
            ? { flex: 1 }
            : { width: columnWidth };

        return (
          <View key={index} style={columnStyle}>
            {child}
          </View>
        );
      })
    : children;

  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...itemStyle,
          pressed && { backgroundColor: theme.colors.bgHover },
        ]}
      >
        <View style={styles.itemContent}>{wrappedChildren}</View>
      </Pressable>
    );
  }

  return (
    <View style={itemStyle}>
      <View style={styles.itemContent}>{wrappedChildren}</View>
    </View>
  );
}

// LIST ITEM TEXT (helper component for consistent text styling)
interface ListItemTextProps {
  children: React.ReactNode;
  variant?: "default" | "muted" | "accent";
  style?: TextStyle;
}

export function ListItemText({
  children,
  variant = "default",
  style,
}: ListItemTextProps) {
  const { theme } = useTheme();

  const variants = {
    default: { color: theme.colors.text },
    muted: { color: theme.colors.textMuted },
    accent: { color: theme.colors.accent },
  };

  return (
    <Text
      style={[
        styles.itemText,
        {
          color: variants[variant].color,
          fontSize: theme.fontSize.base,
          fontFamily: theme.fontFamily.mono.sm,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// LIST ITEM INPUT (helper component for inline inputs)
interface ListItemInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address";
  style?: TextStyle;
}

export function ListItemInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  style,
}: ListItemInputProps) {
  const { theme } = useTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      keyboardType={keyboardType}
      style={[
        styles.itemInput,
        {
          borderWidth: theme.borderWidth.default,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.bgInput,
          borderRadius: theme.radius.none,
          color: theme.colors.text,
          fontSize: theme.fontSize.base,
          fontFamily: theme.fontFamily.mono.sm,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {},
  headerRight: {},
  columnHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  columnHeaderText: {},
  listContent: {},
  item: {
    width: "100%",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemText: {},
  itemInput: {
    minHeight: 36,
  },
});