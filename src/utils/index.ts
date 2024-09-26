import {toWgs84} from "@turf/projection";
import {EPollution, ETypeMonitoringData} from "@/types";
import _ from "lodash";

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
        const baseUrl = IsDevelopment() ? process.env.api : process.env.cloudFront;
        // set file data based on the environment
        const fileData = `${id}_${getDataType(typeData)}_latest.json`;
        // set complete url on the environment
        const url = IsDevelopment()
            ? `${baseUrl}/measurements?entityKey=${id}:${typeData}&typeMonitoringData=${getDataType(typeData)}`
            : `${baseUrl}/${getPrefixBucket(typeData)}/${fileData}`;
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
 * Fetches the next timestamp for a given ID and type of monitoring data.
 *
 * @param {string} id - The ID of the entity to fetch the next timestamp for.
 * @param {string} typeData - The type of monitoring data.
 * @returns {Promise<any>} A promise that resolves to the next timestamp as a string, or null if an error occurs.
 */
export async function fetchNextTimeStamp(id: string, typeData: string) : Promise<any> {

    try {
        // set url based on the environment
        const baseUrl = IsDevelopment()
            ? process.env.api
            : process.env.cloudFront;
        // set file data based on the environment
        const fileNextTs = `next_ts_${id}_${getDataType(typeData)}.txt`;
        // set complete url on the environment
        const url = IsDevelopment()
            ? `${baseUrl}/measurements/next-ts?entityKey=${id}:${typeData}&typeMonitoringData=${getDataType(typeData)}`
            : `${baseUrl}/${getPrefixBucket(typeData)}/${fileNextTs}`;
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

/**
 * Returns the corresponding prefix bucket string based on the provided data type.
 *
 * @param {string} dataType - The type of monitoring data as a string.
 * @returns {string | null} The corresponding prefix bucket string, or null if the data type is not recognized.
 */
export function getPrefixBucket(dataType: string) : string | null {

    // switch statement to return the corresponding prefix bucket string
    switch(dataType) {
        case "AirQuality":
            return 'air_quality';
        case "Flood":
            return 'flood';
        case "LandSlide":
            return 'landslide';
        default:
            return null;
    }
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
        [EPollution.Dust]: "Dust",
        [EPollution.Ammonia]: "Ammonia",
        [EPollution.Pm10]: "PM10",
        [EPollution.Pm25]: "PM2.5",
        [EPollution.AerosolOpticalDepth]: "Aerosol Optical Depth",
        [EPollution.UvIndex]: "UV Index",
        [EPollution.UvIndexClearSky]: "UV Index Clear Sky",
        [EPollution.AlderPollen]: "Alder Pollen",
        [EPollution.BirchPollen]: "Birch Pollen",
        [EPollution.GrassPollen]: "Grass Pollen",
        [EPollution.MugwortPollen]: "Mugwort Pollen",
        [EPollution.OlivePollen]: "Olive Pollen",
        [EPollution.RagweedPollen]: "Ragweed Pollen"
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
        case EPollution.Dust:
            return "Dust";
        case EPollution.Ammonia:
            return "Ammonia";
        case EPollution.Pm10:
            return "PM10";
        case EPollution.Pm25:
            return "PM2.5";
        case EPollution.AerosolOpticalDepth:
            return "Aerosol Optical Depth";
        case EPollution.UvIndex:
            return "UV Index";
        case EPollution.UvIndexClearSky:
            return "UV Index Clear Sky";
        case EPollution.AlderPollen:
            return "Alder Pollen";
        case EPollution.BirchPollen:
            return "Birch Pollen";
        case EPollution.GrassPollen:
            return "Grass Pollen";
        case EPollution.MugwortPollen:
            return "Mugwort Pollen";
        case EPollution.OlivePollen:
            return "Olive Pollen";
        case EPollution.RagweedPollen:
            return "Ragweed Pollen";
        default:
            return "";
    }
}