import React, { useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Input, Card, ComboBox, Button, Badge } from "../theme/index";
import { useAddIngredient } from "../hooks/useAddIngredient";
import LottieView from "lottie-react-native";

export default function AddIngredientScreen() {
  const { loadingPage, loadingAddIngredient, errorMsg, zoneOptions, addIngredient } = useAddIngredient();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [zoneId, setZoneId] = useState<number>();
  const [zoneName, setZoneName] = useState("");

  if (loadingPage) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.center}>
          <LottieView source={theme.colors.bg === "#0B0C10" ? require("../../assets/loadingWhite.json") : require("../../assets/loadingBlack.json")} autoPlay loop style={{ width: 200, height: 200 }}/>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.section}>
        <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Ajouter un ingrédient</Text>
        <Card variant="outlined" padding="md" style={styles.section}>
          <Input label="Nom de l'ingrédient" value={name} onChangeText={setName} containerStyle={{ marginBottom: theme.spacing.md }}/>
          <Input label="Unité de l'ingrédient" value={unit} onChangeText={setUnit} autoCapitalize="none" containerStyle={{ marginBottom: theme.spacing.md }}/>
          <ComboBox label="Choisir une zone" value={zoneName} onChange={setZoneName} options={zoneOptions} onSelectItem={(it) => setZoneId(Number(it.value))} containerStyle={{ marginBottom: theme.spacing.md }} />
          {errorMsg ? (
            <View style={styles.errorRow}>
              <Badge variant="error" style={{ alignSelf: "center" }}>Erreur</Badge>
              <Text style={[styles.errorText, {flex: 1, color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.md}]}>{errorMsg}</Text>
            </View>
          ) : null}
          <Button title="Ajouter" onPress={async () => {
            const ok = await addIngredient(name, unit, zoneId); 
            if (ok) {
              setName("");
              setUnit("");
              setZoneId(undefined);
              setZoneName("");
            }
          }}
          fullWidth loading={loadingAddIngredient}/>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 18,
  },
  section: {
    flexDirection: "column",
    gap: 18,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  center: {
     flex: 1, 
     justifyContent: "center", 
     alignItems: "center",
  },
    errorRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    errorText: {
      flex: 1,
      flexWrap: "wrap",
    },
});
