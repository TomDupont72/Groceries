import { useState, useCallback, useEffect } from "react";
import { getGrocery, insertGrocery, getRecipes, getGroceryRecipe, insertGroceryRecipe, RecipeRow, GroceryLineRow } from "../services/GroceriesService"

export function useGroceries() {
    const [loadingAddGrocery, setLoadingAddGrocery] = useState(false);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>("");
    const [selectedRecipes, setSelectedRecipes] = useState<Record<number, string>>({});
    const [recipeData, setRecipeData] = useState<RecipeRow[]>([]);
    const [groceryRecipeData, setGroceryRecipeData] = useState<GroceryLineRow[]>([]);

    const toggleRecipe = (id: number) => {
        setSelectedRecipes((prev) => {
            const copy = { ...prev };

            if (id in copy) {
                delete copy[id];
            } else {
                copy[id] = "";
            }

            return copy;
        })
    };
    
    const setQuantity = (id: number, quantity: string) => {
        setSelectedRecipes((prev) => {
            if(!(id in prev)) return prev;
            return { ...prev, [id]: quantity};
        })
    };

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
            const dataGroceryId = await getOrCreateGroceryId();
            const dataRecipe = await getRecipes();
            setRecipeData(dataRecipe);

            const dataGroceryRecipe = await getGroceryRecipe(dataGroceryId);
            setGroceryRecipeData(dataGroceryRecipe);
        } catch (error) {
            console.error("[useGroceries.loadAll] failed", error);
            setErrorMsg("Impossible de charger la page.");
        } finally {
            if (mode === "page") setLoadingPage(false);
        else setLoadingRefresh(false);
        }
    }, []);

    const submit = async () => {
        const hasEmptyQuantity = Object.values(selectedRecipes).some(
            (quantity) => quantity.trim() === ""
        );

        if (Object.keys(selectedRecipes).length === 0) {
            setErrorMsg("Une recette au moins doit être sélectionnée.");
            return;
        }

        if (hasEmptyQuantity) {
            setErrorMsg("Toutes les recettes doivent avoir une quantité.");
            return;
        }

        setLoadingAddGrocery(true);
        setErrorMsg(null);

        try {
            const dataGroceryId = await getOrCreateGroceryId();
            const rows = Object.entries(selectedRecipes).map(([id, quantity]) => ({
                groceryId: dataGroceryId,
                recipeId: Number(id),
                quantity: Number(quantity)
            }));

            await insertGroceryRecipe(rows);

            setSelectedRecipes([]);

            await loadAll("refresh");
        } catch (error) {
            console.error("[useGroceries.submit] failed", error);
            setErrorMsg("Impossible d'ajouter les courses.");
        } finally {
            setLoadingAddGrocery(false);
        }

    };

    useEffect(() => {
        loadAll("page");
    }, [loadAll]);

    return {
        loadingAddGrocery,
        loadingPage,
        loadingRefresh,
        errorMsg,
        recipeData,
        selectedRecipes,
        groceryRecipeData,
        toggleRecipe,
        setQuantity,
        submit,
        loadAll,
    }
}   