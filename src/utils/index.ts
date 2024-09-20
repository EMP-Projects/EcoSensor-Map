import {toWgs84} from "@turf/projection";
import getGeoJson from "@/test";

/**
 * Fetches GeoJSON data from a URL or a local file and converts it to WGS84 projection.
 *
 * @param {string} url - The URL to fetch the GeoJSON data from.
 * @param {string} [fileName] - The name of the local file to fetch the GeoJSON data from, used in development mode.
 * @returns {Promise<any>} A promise that resolves to the converted GeoJSON data in WGS84 projection, or null if an error occurs.
 */
export async function fetchDataAndConvertToWgs84(url: string, fileName?: string) : Promise<any> {

    try {
        if (process.env.NODE_ENV != 'development') {
            const geoJson = await fetch(url);
            return toWgs84(geoJson.json());
        } else if (fileName != null)
            return toWgs84(getGeoJson(fileName));
        else
            return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}