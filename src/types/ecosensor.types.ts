
export interface IAirQualityLayer {
    layerName : string;
    typeLayer : any;
    paint: any;
    typeGeometry: string;
    airQuality : IAirQuality | null | undefined;
}

export interface IOsm {
    type: string;
    tags: string [];
    name: string;
    id: number;
    entityKey: string;
    timeStamp: string;
}

export enum EPollution {
    CarbonMonoxide = 0,
    NitrogenDioxide = 1,
    SulphurDioxide = 2,
    Ozone = 3,
    Dust = 4,
    Ammonia = 5,
    Pm10 = 6,
    Pm25 = 7,
    AerosolOpticalDepth = 8,
    UvIndex = 9,
    UvIndexClearSky = 10,
    AlderPollen = 11,
    BirchPollen = 12,
    GrassPollen = 13,
    MugwortPollen = 14,
    OlivePollen = 15,
    RagweedPollen = 16,
}

/**
 * Interface representing air quality data.
 */
export interface IAirQuality {
    /** Latitude of the measurement location. */
    lat: number;
    /** Longitude of the measurement location. */
    lng: number;
    /** Value of the air quality measurement. */
    value: number;
    /** Unit of the air quality measurement value. */
    unit: string;
    /** Date of the air quality measurement. */
    date: string;
    /** Elevation of the measurement location. */
    elevation: number;
    /** European Air Quality Index value. */
    europeanAqi: number;
    /** Text description of the pollution level. */
    pollutionText: string;
    /** Text description of the source of the pollution. */
    sourceText: string;
    /** Source identifier of the pollution data. */
    source: number;
    /** Pollution level value. */
    pollution: number;
    /** Geographic Information System identifier. */
    gisId: number;
    /** Color code representing the air quality level. */
    color: string;
    /** Type of monitoring data. */
    typeMonitoringData: number;
    /** Unique identifier for the air quality data entry. */
    id: number;
    /** Timestamp of the air quality measurement. */
    timeStamp: string;
}

export interface IEcoSensorState {
    pollutionSelected?: EPollution | undefined;
}

export interface IEcoSensorActions {
    setPollutionSelected: (value: EPollution | undefined) => void;
}