import { useEffect, useState, useMemo, useCallback } from "react";
import { ZoneRow, insertIngredient, getZones } from "../services/AddIngredientService"

export function useAddIngredient() {
    const [loadingPage, setLoadingPage] = useState(false);
    const [loadingAddIngredient, setLoadingAddIngredient] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [zoneData, setZoneData] = useState<ZoneRow[]>([]);
    const zoneOptions = useMemo(() => zoneData.map((item) => ({label: item.name, value: String(item.id)})), [zoneData]);

    const addIngredient = async (name: string, unit: string, zoneId?: number)=> {
        const nameTrimmed = name.trim();
        const unitTrimmed = unit.trim();

        if(!nameTrimmed) {
            setErrorMsg("Le nom de l’ingrédient est vide.");
            return false;
        }

        if(zoneId == null) {
            setErrorMsg("La zone est vide.");
            return false;
        }

        setLoadingAddIngredient(true);
        setErrorMsg(null);

        try {
            await insertIngredient(nameTrimmed, unitTrimmed, zoneId);
            return true;
        } catch (error) {
            console.error("[useAddIngredient.addIngredient] failed", error);
            setErrorMsg("Impossible d’ajouter l’ingrédient.");
            return false;
        } finally {
            setLoadingAddIngredient(false);
        }
    };

    const loadAll = useCallback(async () => {
        setLoadingPage(true);
        setErrorMsg(null);
                
        try {
            const dataZone = await getZones();
            setZoneData(dataZone);
        } catch (error) {
            console.error("[useAddIngredient.loadAll] failed", error);
            setErrorMsg("Impossible de charger la page.");
        } finally {
            setLoadingPage(false);
        }
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    return {
        loadingPage,
        loadingAddIngredient,
        errorMsg,
        zoneOptions,
        addIngredient,
        loadAll,
    }
}