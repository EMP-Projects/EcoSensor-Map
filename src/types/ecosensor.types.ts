

export interface IOsm {
    type: string;
    tags: string [];
    name: string;
    id: number;
    entityKey: string;
    timeStamp: string;
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