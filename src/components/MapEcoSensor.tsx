'use client'

import {GeolocateControl} from 'maplibre-gl';
import { DateTime } from 'luxon';

import {
    IConfiguration,
    IMapSource,
    IMapState,
    EProjection, IOsm, IAirQuality
} from "@/types";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import _ from 'lodash';
import {useMapContext} from "@/contexts";
import {LngLat, LngLatBounds, Map, MapOptions, NavigationControl} from "maplibre-gl";
import {fetchDataAndConvertToWgs84, getProperty} from "@/utils";

export function MapEcoSensor(props: IMapState) {
    const [map, setMap] = useState<Map>();
    const [position, setPosition] = useState<number[]>([]);
    const containerMapRef = useRef<HTMLDivElement>(null);
    const divMapRef = useRef<HTMLDivElement>(null);

    const { source } = props;

    // Get the map context
    const { setMapLibre } = useMapContext();

    // Initialize the geoLocate control.
    const geoLocate = useMemo(() => new GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }), []);

    map?.on('mousemove', (e) => {
        console.log(`Mouse move event at ${e.lngLat}`);
    });

    // Add the event geolocate listener to the geoLocate control.
    // This event is fired when the GeolocateControl has determined the user's location.
    // Info: https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/#events
    geoLocate?.on('geolocate', (position: GeolocationPosition) => {
        const coordinate = [position.coords.longitude, position.coords.latitude];
        console.log(`A geoLocate event has occurred at ${coordinate} coordinate.`);
        setPosition(coordinate);
    });

    // Add the event error listener to the geoLocate control.
    geoLocate?.on('error', () => {
        console.error('A geoLocate event error event has occurred.')
    });

    // Add the event outofmaxbounds listener to the geoLocate control.
    geoLocate?.on('outofmaxbounds', () => {
        console.log('A geoLocate outofmaxbounds event has occurred.')
    });

    useEffect(() => {

        if (!props || map) return;

        // Destructure the configuration object.
        const {
            center,
            extent,
            zoom,
            style,
            projection
        } = props;

        // Create a new map instance with the provided configuration.
        const styleMap = {...style,
            projection : {
                "type": `${projection == EProjection.Wgs84 ? "globe" : "mercator"}`
            }
        }

        const mapOptions : MapOptions = {
            container: divMapRef.current as HTMLDivElement,
            style: styleMap,
            zoom: zoom as number ?? 10,
            attributionControl: false,
            transformRequest: (url, resourceType)=> {
                if (resourceType === 'Source') {
                    return {
                        url: url,
                        headers: { 'Access-Control-Allow-Origin': "*" },
                        credentials: 'include'  // Include cookies for cross-origin requests
                    }
                }
            }
        }

        if (extent.some((value) => value > 0)) {
            // Create a new map instance with the provided configuration.
            mapOptions.bounds = new LngLatBounds(new LngLat(extent[0] as number, extent[1] as number), new LngLat(extent[2] as number, extent[3] as number));
        }

        if (center.some((value) => value > 0)) {
            // Create a new map instance with the provided configuration.
            mapOptions.center = {lng: center[0] as number, lat: center[1] as number};
        }

        // Create a new map instance with the provided configuration.
        const m : Map = new Map(mapOptions);
        // Add the control navigation to the map.
        m.addControl(new NavigationControl(), 'top-right');
        // Set the map instance to the state.
        setMap(m);
        // Set the map instance to the context.
        setMapLibre!(m);

    }, [props, map, setMapLibre]);

    // Initialize the center of the map.
    useEffect(() => {
        if (!position || !map) return;
        if (position.some((value) => value <= 0)) return;
        if (position.length < 2) return;
        map.setCenter(new LngLat(position[0], position[1]));
    }, [position, map]);

    useEffect(() => {
        if (!map || !containerMapRef.current || !geoLocate) return;
        // Add the control geoLocate to the map.
        map.addControl(geoLocate, 'top-right');
    }, [map, geoLocate]);

    /**
     * Adds layers to the map based on the provided GeoJSON data.
     *
     * @param {Map} map - The MapLibre GL map instance.
     * @param {string} sourceName - The name of the source to add layers to.
     * @param {any} geoJson - The GeoJSON data containing the features to add.
     */
    const addLayers = (map: Map, sourceName: string, geoJson: any) => {

        if (!map.getSource(sourceName)) return;
        if (!geoJson?.features) return;

        const features : any[] = geoJson.features;
        const opacity = 0.3;
        _.forEach(features, (feature: any) => {

            const propertyOsm : IOsm = getProperty<IOsm>(feature, "OSM");
            const propertiesAirQuality : IAirQuality[] = getProperty<IAirQuality[]>(feature, "Data") ;

            const id : number = propertyOsm.id;
            const layerName : string = `${sourceName}_${id}`;
            const typeLayer : any = feature.geometry.type === 'Polygon' ? 'fill' : 'line';

            // Filter the air quality data from today
            const propertiesAirQualityFromToday : IAirQuality[] = _.takeWhile(propertiesAirQuality, (property: IAirQuality) => {
                const date : DateTime = DateTime.fromISO(property.date);
                return date.isValid && (date.toMillis() >= DateTime.utc().toMillis()) && (date.toMillis() < DateTime.utc().plus({hours: 1}).toMillis());
            });

            const propertyAirQualityNow : IAirQuality = _.sortBy(propertiesAirQualityFromToday, (property: IAirQuality) => property.europeanAqi).reverse()[0];

            if (propertyAirQualityNow?.color) {

                const paint: any = feature.geometry.type === 'Polygon'
                    ? {
                        'fill-color': propertyAirQualityNow.color,
                        'fill-opacity': opacity
                    } : {
                        'line-color': propertyAirQualityNow.color,
                        'line-width': 1,
                        'line-opacity': opacity,
                    };

                const configLayer: any = {
                    id: layerName,
                    type: typeLayer,
                    source: sourceName,
                    metadata: {"source:comment": `EcoSensor data for ${layerName}`},
                    paint: paint,
                }

                if (feature.geometry.type === 'LineString') {
                    configLayer['layout'] = {
                        'line-join': 'round',
                        'line-cap': 'round'
                    };
                }

                map.addLayer(configLayer);
            }
        });
    };

    /**
     * Removes layers from the map based on the provided GeoJSON data.
     *
     * @param {Map} map - The MapLibre GL map instance.
     * @param {string} sourceName - The name of the source to remove layers from.
     * @param {any} geoJson - The GeoJSON data containing the features to remove.
     */
    const removeLayers = (map: Map, sourceName: string, geoJson: any) => {

        if (!map.getSource(sourceName)) return;

        const features: any[] = geoJson.features;
        _.forEach(features, (feature: any) => {
            const propertyOsm: IOsm = feature.properties["OSM"];
            const id: number = propertyOsm.id;
            const layerName: string = `${sourceName}_${id}`;
            map.removeLayer(layerName);
        });

        map.removeSource(sourceName);
    };

    /**
     * Add GeoJson to the map
     * @param map
     * @param source
     */
    const addGeoJson = useCallback(async (source: IMapSource) => {

        if (!map) return;

        _.forEach(source.layers, async (layer: IConfiguration) => {
            // Fetch the data and convert it to WGS84
            const data = await fetchDataAndConvertToWgs84(layer.id, layer.type);
            // Set the source name
            const sourceName : string = `${source.name}_${layer.id}`;
            // Remove the layers from the map
            removeLayers(map, sourceName, data);

            // Add the source to the map
            map.addSource(sourceName, {
                type: 'geojson',
                generateId: true,
                lineMetrics: true,
                data: data as any
            });

            addLayers(map, sourceName, data);
        });
    }, [map]);

    useEffect(() => {
        if (!map || !source) return;
        // Add the GeoJson to the map
        map.on('load', async () => await addGeoJson(source));
    }, [map, addGeoJson, setMapLibre, source]);

    return (
        <>
            <div ref={containerMapRef} className="z-0 absolute top-0 left-0 w-full h-full">
                <div ref={divMapRef} className="z-0 absolute top-0 left-0 w-full h-full" />
            </div>
        </>
    );
}