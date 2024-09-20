'use client'

import { promises as fs } from 'fs';
import {GeoJSON} from "geojson";
import geoJsonGdc from './data/gioia_del_colle_latest.json';
import geoJsonSiena from './data/siena_latest.json';

export async function readGeoJson(pathFile: string) : Promise<GeoJSON> {
    const path = process.cwd() + `${pathFile}`;
    console.log(path);
    const file = await fs.readFile(path, 'utf8');
    console.log(file);
    return JSON.parse(file);
}

export default function getGeoJson(pathFile: string) : any {

    switch (pathFile.toLowerCase()) {
        case 'gioia_del_colle_latest.json':
            return geoJsonGdc;
        case 'siena_latest.json':
            return geoJsonSiena;
        default:
            return null;
    }
}