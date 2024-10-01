import {create} from "zustand";
import {EPollution, IAirQualityData, IEcoSensorActions, IEcoSensorState} from "@/types";
import {LngLatBounds} from "maplibre-gl";

export const useEcoSensorContext = create<IEcoSensorState & IEcoSensorActions>((set) => ({
    pollutionSelected: EPollution.Pm25,
    airQualityData: undefined,
    geoJson: undefined,
    extentMap: undefined,
    setPollutionSelected: (value: EPollution | undefined) => set(() => ({ pollutionSelected: value })),
    setAirQualityData: (data : IAirQualityData[] | undefined) => set(() => ({ airQualityData: data })),
    setGeoJson: (data) => set(() => ({ geoJson: data })),
    setExtentMap: (extent: LngLatBounds | undefined) => set(() => ({ extentMap: extent }))
}));