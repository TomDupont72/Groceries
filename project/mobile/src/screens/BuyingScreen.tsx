import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTheme,
  Card,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  Badge,
  Loading,
} from "../theme/index";
import { useBuying } from "../hooks/useBuying";

export default function BuyingScreen() {
  const { theme } = useTheme();
  const { loadingPage, loadingRefresh, errorMsg, groupedBuyItemsData, loadAll, toggleCheck } =
    useBuying();

  if (loadingPage) return <Loading />;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.section, { paddingBottom: theme.spacing.xl * 3 }]}>
        <View style={styles.rowBetween}>
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: theme.fontFamily.mono.md,
              fontSize: theme.fontSize.xxl,
            }}
          >
            Courses
          </Text>
          <Button title="Rafraîchir" onPress={() => loadAll("refresh")} loading={loadingRefresh} />
        </View>
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
        {Object.keys(groupedBuyItemsData).map((zoneId) => (
          <Card key={zoneId} variant="outlined" padding="md" style={styles.section}>
            <List header={groupedBuyItemsData[Number(zoneId)].zoneName} columns={[20, "flex", 70]}>
              {groupedBuyItemsData[Number(zoneId)].buyItem.map((item) => (
                <ListItem key={item.ingredientId}>
                  <Checkbox checked={item.checked} onPress={() => toggleCheck(item.ingredientId)} />
                  <ListItemText>{item.name}</ListItemText>
                  <ListItemText style={{ alignSelf: "center" }}>
                    {item.total} {item.unit}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Card>
        ))}
      </ScrollView>
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
    justifyContent: "space-between",
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
