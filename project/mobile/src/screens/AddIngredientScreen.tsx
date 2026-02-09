import React, { useEffect, useMemo, useState } from "react";
import { Text, StyleSheet, Alert, View } from "react-native";

import { supabase } from "../api/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Input, Card, ComboBox, Button } from "../theme/index"


type ZoneRow = {
  id: number;
  name: string;
};

export default function AddIngredientScreen() {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [zoneId, setZoneId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [zoneData, setZoneData] = useState<ZoneRow[]>([]);
  const [zoneName, setZoneName] = useState("");

  const zoneOptions = useMemo(
    () => (zoneData ?? []).map(z => ({ label: z.name, value: String(z.id) })),
    [zoneData]
  );

  const submit = async () => {
    if (loading) return;

    if (!name.trim()) {
      Alert.alert("Erreur", "Nom de l'ingrédient vide");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("Ingredient")
        .insert({
          name: name,
          unit: unit,
          zoneId: zoneId,
        })
        .select();

      if (error) throw error;

      console.log("INSERT OK", data);

      setName("");
      setUnit("");
      setZoneName("");
      Alert.alert("Succès", "Ingrédient ajouté");
    } catch (e: any) {
      console.log("SUPABASE ERROR", e);

      Alert.alert("Error", e?.message || e?.details || e?.hint || "L'ajout a échoué");
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) throw new Error("Utilisateur non connecté");

      const { data: zoneData, error: zoneError } = await supabase
        .from("Zone")
        .select("id, name")
        .order("name", { ascending: true });

      if (zoneError) throw zoneError;

      setZoneData(zoneData);
    } catch (e: any) {
      console.log("LOAD ERROR", e);
      Alert.alert("Error", e?.message || e?.details || e?.hint || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.section}>
        <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Ajouter un ingrédient</Text>
        <Card variant="outlined" padding="md" style={styles.section}>
          <Input label="Nom de l'ingrédient" value={name} onChangeText={setName} containerStyle={{ marginBottom: theme.spacing.md }}/>
          <Input label="Unité de l'ingrédient" value={unit} onChangeText={setUnit} autoCapitalize="none" containerStyle={{ marginBottom: theme.spacing.md }}/>
          <ComboBox label="Choisir une zone" value={zoneName} onChange={setZoneName} options={zoneOptions} onSelectItem={(it) => setZoneId(Number(it.value))} containerStyle={{ marginBottom: theme.spacing.md }} />
          <Button title={loading ? "Chargement..." : "Ajouter"} onPress={submit} fullWidth/>
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
});
