
/**
 * Interface representing an air quality layer.
 */
export interface IAirQualityLayer {
    /** Name of the layer. */
    layerName: string;
    /** Type of the layer. */
    typeLayer: any;
    /** Paint properties of the layer. */
    paint: any;
    /** Geometry type of the layer. */
    typeGeometry: string;
    /** Air quality data associated with the layer. */
    airQuality: IAirQuality | null | undefined;
}

/**
 * Interface representing OpenStreetMap (OSM) data.
 */
export interface IOsm {
    /** Type of the OSM entity. */
    type: string;
    /** Tags associated with the OSM entity. */
    tags: string[];
    /** Name of the OSM entity. */
    name: string;
    /** Unique identifier of the OSM entity. */
    id: number;
    /** Entity key of the OSM entity. */
    entityKey: string;
    /** Timestamp of the OSM data. */
    timeStamp: string;
}

export interface IEUAirQualityIndex {
    id: number;
    color: string;
    name: string;
}

/**
 * Interface representing air quality data.
 */
export interface IAirQualityData {
    /** Type of pollution. */
    pollution: EPollution;
    /** Name of the data bucket. */
    bucketName: string;
    /** Prefix for the data. */
    prefix: string;
    /** Data content. */
    data: string;
    /** Entity key of the data. */
    entityKey: string;
    /** Last updated timestamp of the data. */
    lastUpdated: string;
    /** Type of monitoring data. */
    typeMonitoringData: ETypeMonitoringData;
    /** Center coordinates of the data. */
    center: number[];
}

/**
 * Enum representing different types of pollution.
 */
export enum EPollution {
    /** Carbon Monoxide pollution type. */
    CarbonMonoxide = 0,
    /** Nitrogen Dioxide pollution type. */
    NitrogenDioxide = 1,
    /** Sulphur Dioxide pollution type. */
    SulphurDioxide = 2,
    /** Ozone pollution type. */
    Ozone = 3,
    /** PM10 (Particulate Matter 10) pollution type. */
    Pm10 = 4,
    /** PM2.5 (Particulate Matter 2.5) pollution type. */
    Pm25 = 5
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

/**
 * Interface representing the state of the EcoSensor.
 */
export interface IEcoSensorState {
    /** Selected pollution type. */
    pollutionSelected?: EPollution | undefined;
    /** Array of air quality data. */
    airQualityData: IAirQualityData[] | undefined;
    /** Array of air quality properties from today. */
    propertiesFromToday: IAirQuality[] | undefined;
}

/**
 * Interface representing actions that can be performed on the EcoSensor state.
 */
export interface IEcoSensorActions {
    /**
     * Sets the selected pollution type.
     *
     * @param {EPollution | undefined} value - The pollution type to set.
     */
    setPollutionSelected: (value: EPollution | undefined) => void;

    /**
     * Sets the air quality data.
     *
     * @param {IAirQualityData[] | undefined} data - The air quality data to set.
     */
    setAirQualityData: (data: IAirQualityData[] | undefined) => void;

    /**
     * Sets the properties from today.
     *
     * @param {IAirQuality[] | undefined} data - The properties from today to set.
     */
    setPropertiesFromToday: (data: IAirQuality[] | undefined) => void;
}

/**
 * Enum representing different types of monitoring data.
 */
export enum ETypeMonitoringData {
    /** Air quality monitoring data type. */
    AirQuality = 0,
    /** Flood monitoring data type. */
    Flood = 1,
    /** Landslide monitoring data type. */
    LandSlide = 2
}