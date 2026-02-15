import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemeProvider,
  useTheme,
  Button,
  Input,
  Textarea,
  Card,
  Badge,
  Checkbox,
  UserRow,
  Select,
  AccentColor,
  ThemeMode,
  ComboBox,
  Switch,
  Slider,
  RadioGroup,
  List,
  ListItem,
  ListItemText,
  ListItemInput,
} from "../theme/index";

function DemoContent() {
  const { theme, mode, accentColor, setTheme, toggleMode } = useTheme();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(mode);
  const [selectedAccent, setSelectedAccent] = useState<AccentColor>(accentColor);
  const [comboValue, setComboValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState(50);

  const comboOptions = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];

  const radioOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
  ];

  const themeOptions = [
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
  ];

  const accentOptions = [
    { label: "🟡 Yellow", value: "yellow" },
    { label: "🟣 Purple", value: "purple" },
    { label: "🔵 Blue", value: "blue" },
    { label: "🟢 Green", value: "green" },
    { label: "🔴 Red", value: "red" },
    { label: "💗 Pink", value: "pink" },
    { label: "🟠 Orange", value: "orange" },
  ];

  const [ingredients, setIngredients] = useState([
    { id: "1", name: "Farine", checked: true, quantity: "500", unit: "g" },
    { id: "2", name: "Sucre", checked: false, quantity: "200", unit: "g" },
    { id: "3", name: "Oeufs", checked: true, quantity: "3", unit: "pièces" },
    { id: "4", name: "Beurre", checked: false, quantity: "100", unit: "g" },
  ]);

  const updateIngredient = (id: string, field: string, value: any) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleThemeChange = (value: string) => {
    const newMode = value as ThemeMode;
    setSelectedTheme(newMode);
    setTheme(newMode, selectedAccent);
  };

  const handleAccentChange = (value: string) => {
    const newAccent = value as AccentColor;
    setSelectedAccent(newAccent);
    setTheme(selectedTheme, newAccent);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.bg }]}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.section}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.bold,
              },
            ]}
          >
            Component Library 🎨
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fontFamily.mono.md,
              },
            ]}
          >
            Fully themeable React Native components
          </Text>
        </View>

        {/* Theme Switcher */}
        <Card variant="outlined" padding="md" style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.semibold,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            Theme Settings
          </Text>

          <Select
            label="Mode"
            value={selectedTheme}
            options={themeOptions}
            onChange={handleThemeChange}
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <Select
            label="Accent Color"
            value={selectedAccent}
            options={accentOptions}
            onChange={handleAccentChange}
          />

          <View style={{ marginTop: theme.spacing.md }}>
            <Button title="Toggle Dark/Light" onPress={toggleMode} variant="outline" fullWidth />
          </View>
        </Card>

        {/* Buttons */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.semibold,
              },
            ]}
          >
            Buttons
          </Text>

          <View style={styles.buttonRow}>
            <Button title="Filled" onPress={() => {}} variant="filled" />
            <Button title="Outline" onPress={() => {}} variant="outline" />
            <Button title="Ghost" onPress={() => {}} variant="ghost" />
          </View>

          <View style={styles.buttonRow}>
            <Button title="Small" onPress={() => {}} size="sm" />
            <Button title="Medium" onPress={() => {}} size="md" />
            <Button title="Large" onPress={() => {}} size="lg" />
          </View>

          <Button title="Full Width" onPress={() => {}} variant="filled" fullWidth />

          <View style={styles.buttonRow}>
            <Button title="Loading" onPress={() => {}} loading />
            <Button title="Disabled" onPress={() => {}} disabled />
          </View>
        </View>

        {/* Sign In Form Example */}
        <Card variant="outlined" padding="lg" style={styles.section}>
          <Text
            style={[
              styles.cardTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.bold,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            Sign In
          </Text>
          <Text
            style={[
              styles.cardSubtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fontFamily.mono.sm,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            Welcome back! Enter your details to access your account.
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <Checkbox
            checked={rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
            label="Remember me"
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Button title="Sign In" onPress={() => {}} variant="filled" fullWidth />

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.border, marginVertical: theme.spacing.lg },
            ]}
          />

          <View style={styles.buttonRow}>
            <Button title="Github" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
            <Button title="Google" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
          </View>
        </Card>

        {/* Badges */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.semibold,
              },
            ]}
          >
            Badges
          </Text>

          <View style={styles.badgeRow}>
            <Badge variant="default">Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
          </View>

          <View style={styles.badgeRow}>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </View>

          <View style={styles.badgeRow}>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </View>
        </View>

        {/* User Rows */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.semibold,
              },
            ]}
          >
            User Rows
          </Text>

          <View style={{ gap: theme.spacing.sm }}>
            <UserRow
              name="Alex Johnson"
              email="alex@example.com"
              badge={{ text: "Admin", variant: "default" }}
            />

            <UserRow
              name="John Doe"
              email="john@example.com"
              badge={{ text: "Member", variant: "default" }}
            />

            <UserRow
              name="Jane Smith"
              email="jane@example.com"
              badge={{ text: "Pending", variant: "warning" }}
            />
          </View>
        </View>

        {/* Textarea */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.semibold,
              },
            ]}
          >
            Textarea
          </Text>

          <Textarea
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message here..."
            numberOfLines={4}
          />
        </View>

        {/* Cards */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontFamily.mono.md,
                fontWeight: theme.fontWeight.semibold,
              },
            ]}
          >
            Cards
          </Text>

          <Card variant="outlined" padding="md" style={{ marginBottom: theme.spacing.md }}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fontFamily.mono.md,
                  fontWeight: theme.fontWeight.semibold,
                },
              ]}
            >
              Advanced React Patterns
            </Text>
            <Badge variant="accent" size="sm" style={{ marginVertical: theme.spacing.sm }}>
              $49.99
            </Badge>
            <Text
              style={[
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fontFamily.mono.sm,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              Master advanced React patterns and build scalable applications with best practices.
            </Text>
            <Button title="Enroll Now →" onPress={() => {}} variant="filled" />
          </Card>

          <Card padding="md">
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fontFamily.mono.md,
                  fontWeight: theme.fontWeight.semibold,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Elevated Card
            </Text>
            <Text
              style={[
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fontFamily.mono.sm,
                },
              ]}
            >
              This card has a shadow and no border.
            </Text>
          </Card>
        </View>

        <ComboBox
          label="Fruit"
          value={comboValue}
          onChange={setComboValue}
          options={comboOptions}
          containerStyle={{ marginBottom: 16 }}
        />
        <Switch
          value={switchValue}
          onValueChange={setSwitchValue}
          label="Notifications"
          style={{ marginBottom: 16 }}
        />
        <RadioGroup
          options={radioOptions}
          value={radioValue}
          onChange={setRadioValue}
          style={{ marginBottom: 16 }}
        />
        <Slider label="Volume" value={sliderValue} onValueChange={setSliderValue} />
        <Card padding="md">
          <List
            header="Ingrédients"
            headerRight={
              <Button
                title="+ Ajouter"
                onPress={() => console.log("Add ingredient")}
                size="sm"
                variant="outline"
              />
            }
            // columns: [checkbox, nom, quantité, unité]
            columns={[20, "flex", 80, 60]}
          >
            {ingredients.map((item) => (
              <ListItem key={item.id}>
                <Checkbox
                  checked={item.checked}
                  onPress={() => updateIngredient(item.id, "checked", !item.checked)}
                />

                <ListItemText>{item.name}</ListItemText>

                <ListItemInput
                  value={item.quantity}
                  onChangeText={(val) => updateIngredient(item.id, "quantity", val)}
                  placeholder="Qté"
                  keyboardType="numeric"
                />

                <ListItemText variant="muted">{item.unit}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider initialMode="dark" initialAccent="yellow">
      <DemoContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  cardTitle: {},
  cardSubtitle: {},
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    width: "100%",
  },
});
