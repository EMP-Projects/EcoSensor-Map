
export interface IConfiguration {
    id: string;
    center: number[];
    type: string;
}

export enum ETypeMonitoringData {
    AirQuality = 0,
    Flood = 1,
    LandSlide = 2
}