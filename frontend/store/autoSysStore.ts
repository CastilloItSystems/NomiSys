import { NomiSys } from "@/libs/interfaces/autoSysInterface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NomiSysState {
  activeNomiSys: NomiSys | null;
  setActiveNomiSys: (autoSys: NomiSys) => void;
}

export const useNomiSysStore = create<NomiSysState>()(
  persist(
    (set) => ({
      activeNomiSys: null,
      setActiveNomiSys: (autoSys) => set({ activeNomiSys: autoSys }),
    }),
    {
      name: "autoSys-store", // Nombre único para el localStorage
    },
  ),
);
