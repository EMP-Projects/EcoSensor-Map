import {create} from "zustand";
import {EProjection, IMapActions, IMapSource, IMapState} from "@/types";
import {Map} from 'maplibre-gl';

const styleOsm = {
    version: 8,
    sources: {
        osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19
        }
    },
    layers: [
        {
            "id": "osm",
            "type": "raster",
            "source": "osm" // This must match the source key above
        }
    ],
    pitch: 40,
    bearing: 20,
    antialias: true
};

export const useMapContext = create<IMapState & IMapActions>((set) => ({
    zoom: 10,
    style: styleOsm,
    projection: EProjection.WebMercator,
    containerMapRef: '',
    center: [0, 0],
    extent: [0, 0, 0, 0],
    setSource: (value: IMapSource) => set(() => ( { source: value})),
    setProjection: (value: EProjection) => set(() => ( { projection: value})),
    setStyle: (value: string) => set(() => ( { style: value})),
    setZoom: (value: number) => set(() => ( { zoom: value})),
    setExtent: (value: number[]) => set(() => ( { extent: value})),
    setCenter: (value: number[]) => set(() => ( { center: value})),
    setMapLibre: (value: Map) => set(() => ( { mapLibre: value}))
}));