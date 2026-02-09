import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: ViewStyle;
}

export function Tabs({ tabs, activeTab, onTabChange, style }: TabsProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.tabsContainer,
        {
          borderBottomWidth: theme.borderWidth.default,
          borderBottomColor: theme.colors.border,
        },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[
              styles.tab,
              {
                borderBottomWidth: isActive ? theme.borderWidth.thick : 0,
                borderBottomColor: theme.colors.accent,
                paddingBottom: theme.spacing.sm,
              },
            ]}
          >
            {tab.icon && <View style={styles.tabIcon}>{tab.icon}</View>}

            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                  fontSize: theme.fontSize.base,
                  fontFamily: isActive
                    ? theme.fontFamily.mono.md
                    : theme.fontFamily.mono.sm,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Tab Panel Component
interface TabPanelProps {
  activeTab: string;
  tabKey: string;
  children: React.ReactNode;
}

export function TabPanel({ activeTab, tabKey, children }: TabPanelProps) {
  if (activeTab !== tabKey) return null;
  return <View style={styles.tabPanel}>{children}</View>;
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    gap: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabIcon: {},
  tabLabel: {},
  tabPanel: {
    paddingTop: 16,
  },
});