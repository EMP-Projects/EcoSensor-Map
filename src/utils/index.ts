import {toWgs84} from "@turf/projection";
import {ETypeMonitoringData} from "@/types";

/**
 * Fetches GeoJSON data from a URL or a local file and converts it to WGS84 projection.
 *
 * @param id - The ID of the GeoJSON data.
 * @param typeData - The type of monitoring data.
 * @returns {Promise<any>} A promise that resolves to the converted GeoJSON data in WGS84 projection, or null if an error occurs.
 */
export async function fetchDataAndConvertToWgs84(id: string, typeData: string) : Promise<any> {

    try {
        // set url based on the environment
        const baseUrl = process.env.NODE_ENV === "development"
            ? process.env.api
            : process.env.cloudFront;
        // set file data based on the environment
        const fileData = `${id}_${getDataType(typeData)}_latest.geojson`;
        // set complete url on the environment
        const url = process.env.NODE_ENV === "development"
            ? `${baseUrl}/measurements?entityKey=${id}:${typeData}&typeMonitoringData=${getDataType(typeData)}`
            : `${baseUrl}/data/${fileData}`;
        // fetch the GeoJSON data
        const geoJson = await fetch(url);
        // convert the GeoJSON data to WGS84 projection
        return toWgs84(await geoJson.json());
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Fetches the next timestamp for a given ID and type of monitoring data.
 *
 * @param {string} id - The ID of the entity to fetch the next timestamp for.
 * @param {string} typeData - The type of monitoring data.
 * @returns {Promise<any>} A promise that resolves to the next timestamp as a string, or null if an error occurs.
 */
export async function fetchNextTimeStamp(id: string, typeData: string) : Promise<any> {

    try {
        // set url based on the environment
        const baseUrl = process.env.NODE_ENV === "development"
            ? process.env.api
            : process.env.cloudFront;
        // set file data based on the environment
        const fileData = `next_ts_${id}_${getDataType(typeData)}.txt`;
        // set complete url on the environment
        const url = process.env.NODE_ENV === "development"
            ? `${baseUrl}/measurements/next-ts?entityKey=${id}:${typeData}&typeMonitoringData=${getDataType(typeData)}`
            : `${baseUrl}/${fileData}`;
        // fetch the next timestamp
        const geoJson = await fetch(url);
        // return the next timestamp
        return await geoJson.text();
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Returns the corresponding ETypeMonitoringData enum value based on the provided data type string.
 *
 * @param {string} dataType - The type of monitoring data as a string.
 * @returns {ETypeMonitoringData | null} The corresponding ETypeMonitoringData enum value, or null if the data type is not recognized.
 */
export function getDataType(dataType: string) : number | null {

    // switch statement to return the corresponding ETypeMonitoringData enum value
    switch(dataType) {
        case "AirQuality":
            return ETypeMonitoringData.AirQuality as number;
        case "Flood":
            return ETypeMonitoringData.Flood as number;
        case "LandSlide":
            return ETypeMonitoringData.LandSlide as number;
        default:
            return null;
    }
}