'use client'

import geoJsonGdc from '@/_dev/data/gioia_del_colle_latest.json';
import geoJsonSiena from '@/_dev/data/siena_latest.json';

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