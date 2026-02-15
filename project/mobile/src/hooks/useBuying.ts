import { useState, useCallback, useEffect, useMemo } from "react";
import { getGrocery, insertGrocery, upsertGroceryIngredient, getBuyItems, BuyItemRow, GroupedBuyItemRow } from "../services/BuyingService";

export function useBuying() {
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>("");
    const [buyItemsData, setBuyItemsData] = useState<BuyItemRow[]>([]);

    const groupedBuyItemsData = useMemo(() => {
        const record: Record<number, GroupedBuyItemRow> = {};
        for (const item of buyItemsData) {
            const key = item.zoneId;
            if (!(key in record)) record[key] = {zoneName: item.zoneName, buyItem: []};
            record[key].buyItem.push(item);
        }

        return record;
    }, [buyItemsData])

    const getOrCreateGroceryId = async () => {
        setErrorMsg(null);

        try {
            const dataGrocery = await getGrocery();

            if (dataGrocery?.id != null) return dataGrocery.id;

            const dataGroceryInserted = await insertGrocery();

            return dataGroceryInserted.id;
        } catch (error) {
            console.error("[useGroceries.getOrCreateGroceryId] failed", error);
            setErrorMsg("Impossible de récupérer les courses.");
        }
    };

    const loadAll = useCallback(async (mode: ("page" | "refresh")) => {
        if (mode === "page") setLoadingPage(true);
        else setLoadingRefresh(true);
        setErrorMsg(null);

        try {
            const groceryId = await getOrCreateGroceryId();

            const dataBuyItems = await getBuyItems(groceryId);
            setBuyItemsData(dataBuyItems);
        } catch (error) {
            console.error("[useGroceries.loadAll] failed", error);
            setErrorMsg("Impossible de charger la page.");
        } finally {
            if (mode === "page") setLoadingPage(false);
            else setLoadingRefresh(false);
        }
    }, []);

    const toggleCheck = async (ingredientId: number) => {
        setErrorMsg(null);
        const updatedBuyItemsData = buyItemsData.map((item) => (item.ingredientId === ingredientId ? { ...item, checked: !item.checked} : item));
        const checked = updatedBuyItemsData.find((item) => item.ingredientId === ingredientId)?.checked ?? false;
        setBuyItemsData(updatedBuyItemsData);

        try {
            await upsertGroceryIngredient(ingredientId, checked);

            await loadAll("refresh");
        } catch (error) {
            console.error("[useGroceries.toggleCheck] failed", error);
            setErrorMsg("Impossible de modifier le statut de l'ingrédient.");
        }
    }

    useEffect(() => {
        loadAll("page");
    }, [loadAll]);

    return {
        loadingPage,
        loadingRefresh,
        errorMsg,
        groupedBuyItemsData,
        loadAll,
        toggleCheck,
    }
}