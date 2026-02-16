import React, { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Input, Card, ComboBox, Button, Badge, Loading } from "../theme/index";
import { useAddIngredient } from "../hooks/useAddIngredient";
import { styles } from "../theme/theme";

export default function AddIngredientScreen() {
  const { loadingPage, loadingAddIngredient, errorMsg, zoneOptions, addIngredient } =
    useAddIngredient();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [zoneId, setZoneId] = useState<number>();
  const [zoneName, setZoneName] = useState("");

  if (loadingPage) return <Loading />;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.section}>
        <Text
          style={{
            color: theme.colors.text,
            fontFamily: theme.fontFamily.mono.md,
            fontSize: theme.fontSize.xxl,
          }}
        >
          Ajouter un ingrédient
        </Text>
        <Card variant="outlined" padding="md" style={styles.section}>
          <Input
            label="Nom de l'ingrédient"
            value={name}
            onChangeText={setName}
            containerStyle={{ marginBottom: theme.spacing.md }}
          />
          <Input
            label="Unité de l'ingrédient"
            value={unit}
            onChangeText={setUnit}
            autoCapitalize="none"
            containerStyle={{ marginBottom: theme.spacing.md }}
          />
          <ComboBox
            label="Choisir une zone"
            value={zoneName}
            onChange={setZoneName}
            options={zoneOptions}
            onSelectItem={(it) => setZoneId(Number(it.value))}
            containerStyle={{ marginBottom: theme.spacing.md }}
          />
          {errorMsg ? (
            <View style={styles.errorRow}>
              <Badge variant="error" style={{ alignSelf: "center" }}>
                Erreur
              </Badge>
              <Text
                style={[
                  styles.errorText,
                  {
                    flex: 1,
                    color: theme.colors.text,
                    fontFamily: theme.fontFamily.mono.md,
                    fontSize: theme.fontSize.md,
                  },
                ]}
              >
                {errorMsg}
              </Text>
            </View>
          ) : null}
          <Button
            title="Ajouter"
            onPress={async () => {
              const ok = await addIngredient(name, unit, zoneId);
              if (ok) {
                setName("");
                setUnit("");
                setZoneId(undefined);
                setZoneName("");
              }
            }}
            fullWidth
            loading={loadingAddIngredient}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}
