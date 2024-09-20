import {toWgs84} from "@turf/projection";

/**
 * Fetches GeoJSON data from a URL or a local file and converts it to WGS84 projection.
 *
 * @param {string} url - The URL to fetch the GeoJSON data from.
 * @returns {Promise<any>} A promise that resolves to the converted GeoJSON data in WGS84 projection, or null if an error occurs.
 */
export async function fetchDataAndConvertToWgs84(url: string) : Promise<any> {

    try {
        const geoJson = await fetch(url);
        return toWgs84(await geoJson.json());
    } catch (error) {
        console.error(error);
        return null;
    }
}