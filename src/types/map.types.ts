import {Map} from "maplibre-gl";
import {IAirQualityData} from "@/types";

export interface IMapProjection {
    style: any;
    projection: EProjection;
}

export interface IMapView extends IMapProjection {
    zoom: number;
    extent: number[];
    center: number[];
}

export interface IMapConfigSource {
    source?: IMapSource;
}

export interface IMapState extends IMapProjection, IMapView, IMapConfigSource {
    mapLibre?: Map;
    containerMapRef: HTMLDivElement | string;
}

export interface IMapActions {
    setSource: (value: IMapSource) => void;
    setStyle: (value: any) => void;
    setProjection: (value: EProjection) => void;
    setZoom?: (value: number) => void;
    setExtent?: (value: number[]) => void;
    setCenter?: (value: number[]) => void;
    setMapLibre?: (value: Map) => void;
}

export interface IMapSource {
    url: string;
    name: string;
    layers?: IAirQualityData[] | undefined;
}

export enum EProjection {
    WebMercator,
    Wgs84
}