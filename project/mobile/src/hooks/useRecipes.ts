import { useState, useEffect, useCallback } from "react";
import { IngredientRow, RecipeRow, getIngredients, getRecipes, insertRecipe, insertRecipeIngredient } from "../services/RecipesService";

export function useRecipes() {
    const [loadingPage, setLoadingPage] = useState(false);
    const [loadingAddRecipe, setLoadingAddRecipe] = useState(false);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [ingredientData, setIngredientData] = useState<IngredientRow[]>([]);
    const [recipeData, setRecipeData] = useState<RecipeRow[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<Record<number, string>>({});
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const toggleIngredient = (id: number) => {
        setSelectedIngredients((prev) => {
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
        setSelectedIngredients((prev) => {
            if(!(id in prev)) return prev;
            return { ...prev, [id]: quantity};
        })
    };

    const loadAll = useCallback(async (mode: "page" | "refresh") => {
        if (mode === "page") setLoadingPage(true);
        else setLoadingRefresh(true);
        setErrorMsg(null);

        try {
            const dataIngredient = await getIngredients();
            setIngredientData(dataIngredient);

            const dataRecipe = await getRecipes();
            setRecipeData(dataRecipe);
        } catch (error) {
            console.error("[useRecipes.loadAll] failed", error);
            setErrorMsg("Impossible de charger la page.");
        } finally {
            if (mode === "page") setLoadingPage(false);
            else setLoadingRefresh(false);
        }
    }, []);

    const submit = async (recipeName: string) => {
        const recipeNameTrimmed = recipeName.trim();
        const hasEmptyQuantity = Object.values(selectedIngredients).some(
            (quantity) => quantity.trim() === ""
        );

        if (!recipeNameTrimmed) {
            setErrorMsg("Le nom de la recette est vide.");
            return;
        }

        if (Object.keys(selectedIngredients).length === 0) {
            setErrorMsg("Un ingrédient au moins doit être sélectionné.");
            return;
        }

        if (hasEmptyQuantity) {
            setErrorMsg("Tous les ingrédients doivent avoir une quantité.");
            return;
        }

        setLoadingAddRecipe(true);
        setErrorMsg(null);

        try {
            const dataRecipe = await insertRecipe(recipeNameTrimmed);

            const rows = Object.entries(selectedIngredients).map(([id, quantity]) => ({
                recipeId: dataRecipe.id,
                ingredientId: Number(id),
                quantity: Number(quantity),
              }));

            await insertRecipeIngredient(rows);

            setSelectedIngredients([]);

            await loadAll("refresh");
            } catch (error) {
                console.error("[useRecipes.submit] failed", error);
                setErrorMsg("Impossible d'ajouter la recette.");
            } finally {
                setLoadingAddRecipe(false);
        }  
    };

    useEffect(() => {
        loadAll("page");
    }, [loadAll]);

    return {
        loadingPage,
        loadingRefresh,
        loadingAddRecipe,
        ingredientData,
        selectedIngredients,
        setQuantity,
        toggleIngredient,
        submit,
        loadAll,
        recipeData,
        errorMsg,
    }
}