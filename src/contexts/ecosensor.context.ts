import {create} from "zustand";
import {EPollution, IAirQualityData, IEcoSensorActions, IEcoSensorState} from "@/types";

export const useEcoSensorContext = create<IEcoSensorState & IEcoSensorActions>((set) => ({
    pollutionSelected: EPollution.Pm25,
    airQualityData: undefined,
    propertiesFromToday: undefined,
    setPollutionSelected: (value: EPollution | undefined) => set(() => ({ pollutionSelected: value })),
    setAirQualityData: (data : IAirQualityData[] | undefined) => set(() => ({ airQualityData: data })),
    setPropertiesFromToday: (data) => set(() => ({ propertiesFromToday: data }))
}));