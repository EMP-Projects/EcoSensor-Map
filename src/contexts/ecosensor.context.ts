import {create} from "zustand";
import {EPollution, IEcoSensorActions, IEcoSensorState} from "@/types";

export const useEcoSensorContext = create<IEcoSensorState & IEcoSensorActions>((set) => ({
    pollutionSelected: undefined,
    setPollutionSelected: (value: EPollution | undefined) => set(() => ({ pollutionSelected: value }))
}));