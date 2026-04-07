import { getNomiSyss } from "@/app/api/autoSysService";
import { NomiSys } from "@/libs/interfaces/autoSysInterface";
import { useCallback, useEffect } from "react";
import useSWR from "swr";

// Tipo para el estado consolidado
interface NomiSysData {
  autoSyss: NomiSys[];
}

/**
 * Hook para obtener y manejar todos los datos globales de la aplicación (sin filtrar por refinería), usando SWR.
 * @param recepcionModificado - Recepción modificada para actualizar en el estado
 */
const fetcher = async () => {
  const results = await Promise.allSettled([getNomiSyss()]);
  console.log(results);
  const [autoSyssDB] = results.map((r) =>
    r.status === "fulfilled" ? r.value : null,
  );

  return {
    autoSyss: autoSyssDB?.autoSys || [],
  };
};

export const useNomiSysDataFull = () => {
  const { data, error, isLoading, mutate } = useSWR<NomiSysData>(
    "autoSys-data-global",
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    ...(data || {}),
    loading: isLoading,
    error,
    // updateRecepciones,
    mutateNomiSysDataFull: useCallback(() => {
      mutate();
    }, [mutate]),
  };
};
