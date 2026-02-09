import React from "react";
import { View, Text, Image, StyleSheet, ViewStyle, Pressable } from "react-native";
import { useTheme } from "./ThemeProvider";
import { Badge } from "./Badge";

interface AvatarProps {
  source?: { uri: string };
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  style?: ViewStyle;
}

export function Avatar({ source, name, size = "md", style }: AvatarProps) {
  const { theme } = useTheme();

  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const fontSize = {
    sm: theme.fontSize.sm,
    md: theme.fontSize.base,
    lg: theme.fontSize.lg,
    xl: theme.fontSize.xl,
  };

  const avatarSize = sizes[size];
  const textSize = fontSize[size];

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: theme.colors.accent,
          borderWidth: theme.borderWidth.thin,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: textSize,
              color: theme.colors.accentContrast,
              fontWeight: theme.fontWeight.semibold,
            },
          ]}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

interface UserRowProps {
  name: string;
  email?: string;
  avatar?: { uri: string };
  badge?: {
    text: string;
    variant?: "default" | "accent" | "success" | "warning" | "error" | "info";
  };
  onPress?: () => void;
  style?: ViewStyle;
}

export function UserRow({
  name,
  email,
  avatar,
  badge,
  onPress,
  style,
}: UserRowProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.userRow,
        {
          backgroundColor: theme.colors.bgCard,
          borderWidth: theme.borderWidth.default,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
        },
        style,
      ]}
    >
      <Avatar source={avatar} name={name} size="md" />

      <View style={styles.userInfo}>
        <Text
          style={[
            styles.userName,
            {
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.md,
              fontWeight: theme.fontWeight.semibold,
            },
          ]}
        >
          {name}
        </Text>
        {email && (
          <Text
            style={[
              styles.userEmail,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fontFamily.mono.sm
              },
            ]}
          >
            {email}
          </Text>
        )}
      </View>

      {badge && (
        <Badge variant={badge.variant} size="sm">
          {badge.text}
        </Badge>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    textAlign: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 2,
  },
  userEmail: {},
  pressed: {
    opacity: 0.8,
  },
});