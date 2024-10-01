import {toWgs84} from "@turf/projection";
import {EPollution, ETypeMonitoringData, IAirQualityData} from "@/types";
import _ from "lodash";
import chroma from 'chroma-js';
import booleanWithin from "@turf/boolean-contains";

export async function fetchAirQualityDataAndConvertToWgs84(airQualityData : IAirQualityData) : Promise<any> {

    try {
        // set complete url on the environment
        const url = IsDevelopment()
            ? `${process.env.api}/measurements/air-quality/?entityKey=${airQualityData.entityKey}:AirQuality&typeMonitoringData=${airQualityData.typeMonitoringData}&pollution=${airQualityData.pollution}`
            : `${process.env.cloudFront}/air_quality/${airQualityData.data}`;
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
 * Checks if a bounding box intersects with a map extent.
 *
 * @param {number[]} bbox - The bounding box to check.
 * @param {number[]} extentMap - The map extent to check against.
 * @returns {boolean} True if the bounding box intersects with the map extent, otherwise false.
 */
export function IsIntersection(bbox : number[], extentMap : number[]) : boolean {
    const poly = turf.bboxPolygon(bbox);
    const extent = turf.bboxPolygon(extentMap);
    return booleanWithin(poly, extent);
}

/**
 * Retrieves a property value from a feature based on the property name.
 *
 * @param {any} feature - The feature object containing properties.
 * @param {string} nameProperty - The name of the property to retrieve.
 * @returns {any} The value of the specified property.
 */
export function getProperty<Type>(feature: any, nameProperty: string): Type {

    if (IsDevelopment()) {
        // Get the property object based on the key
        const propertyObj : any = _.find(feature.properties, prop => prop["key"] === nameProperty);
        return propertyObj["value"];
    }

    return convertObjectKeysToCamelCase<Type>(feature.properties[nameProperty]);
}

export function getArrayProperty<Type>(feature: any, nameProperty: string): Type[] {
    const obj : Type[] = getProperty(feature, nameProperty);
    return convertArrayObjectKeysToCamelCase<Type>(obj);
}

/**
 * Converts the keys of an object to camelCase using lodash.
 *
 * @param {Record<string, any>} obj - The object to convert.
 * @returns {Record<string, any>} The object with keys converted to camelCase.
 */
export function convertObjectKeysToCamelCase<Type>(obj: any): Type {
    const result: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = _.camelCase(key);
            result[newKey] = obj[key];
        }
    }
    return result;
}

export function convertArrayObjectKeysToCamelCase<Type>(arrayObj: any[]): Type[] {
    return _.map(arrayObj, (obj) => convertObjectKeysToCamelCase(obj));
}

/**
 * Checks if the current environment is development and the app environment is local.
 *
 * @returns {boolean} True if the environment is development and the app environment is local, otherwise false.
 */
export function IsDevelopment() : boolean {
    return process.env.NODE_ENV === "development" && process.env.appEnv == "local";
}

/**
 * Fetches air quality data from a remote source.
 *
 * @returns {Promise<IAirQualityData[] | undefined>} A promise that resolves to an array of IAirQualityData objects, or undefined if an error occurs.
 */
export async function fetchAirQualityData() : Promise<IAirQualityData[] | undefined> {

    try {
        // Set file data based on the environment
        const url : string = `${process.env.cloudFront}/air_quality/map.json`;
        // Fetch the configuration data
        const geoJson = await fetch(url);
        // Return the parsed JSON data as an array of IAirQualityData objects
        return await geoJson.json() as IAirQualityData[];
    } catch (error) {
        console.error(error);
        return undefined;
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

/**
 * Returns the EPollution enum value corresponding to the given textual description.
 *
 * @param {string} value - The textual description of the pollution type.
 * @returns {EPollution | undefined} The EPollution enum value corresponding to the description, or undefined if not found.
 */
export function getPollutionKeyByValue(value: string): EPollution | undefined {
    const descriptions = getPollutionDescriptions();
    return Object.keys(descriptions).find(key => descriptions[key as unknown as EPollution] === value) as EPollution | undefined;
}

export function generateColorScale() : string[] {
    const scale = chroma.scale(['green', 'red']).domain([1, 1000]);
    const colors = [];
    for (let i = 1; i <= 1000; i += 100) {
        colors.push(scale(i).hex());
    }
    return colors;
}

export function getNewColorScale(value: number) : string {
    const colors : string[] = generateColorScale();
    const valueInt : number = value > 1000 ? 100 : Math.round(value / 100);
    return colors[valueInt];
}

/**
 * Returns a record of EPollution enum values and their corresponding textual descriptions.
 *
 * @returns {Record<EPollution, string>} A record where the keys are EPollution enum values and the values are their descriptions.
 */
export function getPollutionDescriptions(): Record<EPollution, string> {
    return {
        [EPollution.CarbonMonoxide]: "Carbon Monoxide",
        [EPollution.NitrogenDioxide]: "Nitrogen Dioxide",
        [EPollution.SulphurDioxide]: "Sulphur Dioxide",
        [EPollution.Ozone]: "Ozone",
        [EPollution.Pm10]: "PM10",
        [EPollution.Pm25]: "PM2.5"
    };
}

/**
 * Returns the textual representation of a given pollution type.
 *
 * @param {EPollution} pollution - The pollution type as an enum value.
 * @returns {string} The textual representation of the pollution type.
 */
export function getPollutionText(pollution: EPollution): string {
    switch (pollution) {
        case EPollution.CarbonMonoxide:
            return "Carbon Monoxide";
        case EPollution.NitrogenDioxide:
            return "Nitrogen Dioxide";
        case EPollution.SulphurDioxide:
            return "Sulphur Dioxide";
        case EPollution.Ozone:
            return "Ozone";
        case EPollution.Pm10:
            return "PM10";
        case EPollution.Pm25:
            return "PM2.5";
        default:
            return "";
    }
}