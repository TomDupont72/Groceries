import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Card, List, ListItem, ListItemText, Checkbox, Button } from "../theme/index"
import { useBuying } from "../hooks/useBuying";

export default function BuyingScreen() {
  const { theme } = useTheme();
  const { loadingPage, loadingRefresh, errorMsg, groupedBuyItemsData, loadAll, toggleCheck } = useBuying();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.section, { paddingBottom: theme.spacing.xl * 3 }]}>
        <View style={styles.rowBetween}>
          <Text style={{color: theme.colors.text, fontFamily: theme.fontFamily.mono.md, fontSize: theme.fontSize.xxl}}>Courses</Text>
          <Button title="Rafraîchir" onPress={() => loadAll("refresh")} loading={loadingRefresh}/>
        </View>
        {groupedBuyItemsData.map((section) => (
          <Card key={section.zoneId} variant="outlined" padding="md" style={styles.section}>
            <List header={section.zoneName} columns={[20, "flex", 70]}>
            {section.buyItem.map((item) => (
              <ListItem key={item.ingredientId}>
                <Checkbox checked={item.checked} onPress={() => toggleCheck(item.ingredientId)}/>
                <ListItemText>{item.name}</ListItemText>
                <ListItemText style={{alignSelf: "center"}}>{item.total} {item.unit}</ListItemText>
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
});