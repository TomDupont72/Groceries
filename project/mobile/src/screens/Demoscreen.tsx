import React from "react";
import { View, StyleSheet } from "react-native";
import { Screen } from "../theme/Screen";
import {
  Card,
  RetroButton,
  RetroInput,
  RetroRow,
  RetroCheckbox,
  Badge,
  Heading,
  BodyText,
} from "../theme/components";
import ComboBox from "../components/ComboBox";
import { tokens } from "../theme/tokens";

export default function DemoScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [comboValue, setComboValue] = React.useState("");
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(true);
  const [selectedRow, setSelectedRow] = React.useState<number | null>(null);

  const sampleDict = {
    "Apple": "Fruit",
    "Banana": "Fruit",
    "Carrot": "Vegetable",
    "Cucumber": "Vegetable",
  };

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.section}>
        <Heading level={1}>🎨 Component Library</Heading>
        <BodyText variant="muted" style={{ marginTop: 8 }}>
          React Native • Hard shadow animations • Nouvelle palette
        </BodyText>
      </View>

      {/* Buttons */}
      <View style={styles.section}>
        <Heading level={2}>Buttons</Heading>
        <BodyText variant="muted" size="sm" style={{ marginBottom: 12 }}>
          Clique pour voir l'animation hard shadow ⬇️
        </BodyText>

        <View style={styles.buttonRow}>
          <RetroButton 
            title="Primary" 
            onPress={() => console.log("Primary")} 
            variant="primary"
          />
          <RetroButton 
            title="Secondary" 
            onPress={() => console.log("Secondary")} 
            variant="secondary"
          />
        </View>

        <View style={styles.buttonRow}>
          <RetroButton 
            title="Accent" 
            onPress={() => console.log("Accent")} 
            variant="accent"
          />
          <RetroButton 
            title="Outline" 
            onPress={() => console.log("Outline")} 
            variant="outline"
          />
        </View>

        <RetroButton 
          title="Disabled" 
          onPress={() => {}} 
          variant="accent"
          disabled
        />
      </View>

      {/* Inputs */}
      <View style={styles.section}>
        <Heading level={2}>Inputs</Heading>

        <RetroInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
        />

        <RetroInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />

        <RetroInput
          label="Error State"
          value="invalid"
          onChangeText={() => {}}
          error="This field has an error"
          state="error"
        />

        <ComboBox
          label="ComboBox"
          dict={sampleDict}
          value={comboValue}
          onChange={setComboValue}
          placeholder="Type to search..."
        />
      </View>

      {/* Cards */}
      <View style={styles.section}>
        <Heading level={2}>Cards</Heading>

        <Card variant="default">
          <Heading level={3}>Default Card</Heading>
          <BodyText variant="muted" style={{ marginTop: 8 }}>
            This is a card with the default white border.
          </BodyText>
        </Card>

        <Card variant="accent" style={{ marginTop: 12 }}>
          <Heading level={3} variant="accent">Accent Card</Heading>
          <BodyText style={{ marginTop: 8 }}>
            This card has the violet accent border to draw attention.
          </BodyText>
          <View style={{ marginTop: 16 }}>
            <RetroButton 
              title="Action" 
              onPress={() => {}} 
              variant="accent"
            />
          </View>
        </Card>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Heading level={2}>Badges</Heading>

        <View style={styles.badgeRow}>
          <Badge variant="default">Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
        </View>

        <View style={styles.badgeRow}>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </View>

        <View style={styles.badgeRow}>
          <Badge variant="accent" size="sm">Small</Badge>
          <Badge variant="accent" size="md">Medium</Badge>
        </View>
      </View>

      {/* Checkboxes */}
      <View style={styles.section}>
        <Heading level={2}>Checkboxes</Heading>

        <RetroCheckbox 
          checked={checked1} 
          onPress={() => setChecked1(!checked1)}
          label="Interactive checkbox"
        />
        
        <View style={{ height: 12 }} />
        
        <RetroCheckbox 
          checked={checked2} 
          onPress={() => setChecked2(!checked2)}
          label="With accent color when checked"
        />
      </View>

      {/* Rows */}
      <View style={styles.section}>
        <Heading level={2}>Rows (Lists)</Heading>
        <BodyText variant="muted" size="sm" style={{ marginBottom: 12 }}>
          Les rows sélectionnés ont la border accent
        </BodyText>

        <View style={{ gap: 8 }}>
          <RetroRow 
            selected={selectedRow === 1}
            onPress={() => setSelectedRow(1)}
          >
            <BodyText>First Item</BodyText>
            <Badge variant="accent" size="sm">New</Badge>
          </RetroRow>

          <RetroRow 
            selected={selectedRow === 2}
            onPress={() => setSelectedRow(2)}
          >
            <BodyText>Second Item</BodyText>
            <Badge variant="success" size="sm">Active</Badge>
          </RetroRow>

          <RetroRow 
            selected={selectedRow === 3}
            onPress={() => setSelectedRow(3)}
          >
            <BodyText>Third Item</BodyText>
            <RetroCheckbox checked={selectedRow === 3} />
          </RetroRow>
        </View>
      </View>

      {/* Typography */}
      <View style={styles.section}>
        <Heading level={2}>Typography</Heading>

        <Heading level={1}>Heading 1 (24px)</Heading>
        <Heading level={2} style={{ marginTop: 8 }}>Heading 2 (20px)</Heading>
        <Heading level={3} style={{ marginTop: 8 }}>Heading 3 (18px)</Heading>

        <View style={{ marginTop: 16, gap: 8 }}>
          <BodyText variant="default">Default body text</BodyText>
          <BodyText variant="muted">Muted body text</BodyText>
          <BodyText variant="accent">Accent body text</BodyText>
          <BodyText variant="error">Error body text</BodyText>
          <BodyText variant="success">Success body text</BodyText>
        </View>
      </View>

      {/* Color Palette */}
      <View style={styles.section}>
        <Heading level={2}>Color Palette</Heading>
        
        <View style={styles.colorGrid}>
          <ColorBox color={tokens.colors.bg} name="bg" />
          <ColorBox color={tokens.colors.card} name="card" />
          <ColorBox color={tokens.colors.text} name="text" />
          <ColorBox color={tokens.colors.textMuted} name="muted" />
          <ColorBox color={tokens.colors.accent} name="accent" />
          <ColorBox color={tokens.colors.success} name="success" />
          <ColorBox color={tokens.colors.warning} name="warning" />
          <ColorBox color={tokens.colors.error} name="error" />
        </View>
      </View>

      <View style={{ height: 40 }} />
    </Screen>
  );
}

function ColorBox({ color, name }: { color: string; name: string }) {
  return (
    <View style={styles.colorItem}>
      <View style={[styles.colorBox, { backgroundColor: color }]} />
      <BodyText size="sm" variant="muted" style={{ textAlign: "center" }}>
        {name}
      </BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: tokens.spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
    flexWrap: "wrap",
  },
  badgeRow: {
    flexDirection: "row",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
    flexWrap: "wrap",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.md,
  },
  colorItem: {
    width: 70,
    alignItems: "center",
  },
  colorBox: {
    width: 60,
    height: 60,
    borderWidth: tokens.stroke.thin,
    borderColor: tokens.colors.border,
    marginBottom: 6,
  },
});