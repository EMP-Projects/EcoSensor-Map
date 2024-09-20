'use client'

import {GeolocateControl} from 'maplibre-gl';

import {
    IConfiguration,
    IMapSource,
    IMapState,
    EProjection
} from "@/types";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import _ from 'lodash';
import {useMapContext} from "@/contexts";
import {LngLat, LngLatBounds, Map, MapOptions, NavigationControl} from "maplibre-gl";
import {fetchDataAndConvertToWgs84} from "@/utils";

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
        console.log(JSON.stringify(e.point));
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
     * Redraw the map
     * @param map
     * @param sourceName
     */
    const reDrawMap = useCallback((sourceName: string) => {
        if (!map) return;

        // Remove the tiles for a particular source
        map.style.sourceCaches[sourceName].clearTiles();

        // Load the new tiles for the current viewport (map.transform -> viewport)
        map.style.sourceCaches[sourceName].update(map.transform);

        // Force a repaint, so that the map will be repainted without you having to touch the map
        map.triggerRepaint();
    }, [map]);

    /**
     * Add GeoJson to the map
     * @param map
     * @param source
     */
    const addGeoJson = useCallback(async (source: IMapSource) => {

        if (!map) return;

        _.forEach(source.layers, async (layer: IConfiguration) => {
            // Fetch the data and convert it to WGS84
            const data = await fetchDataAndConvertToWgs84(source.url, layer.name);
            if (process.env.NODE_ENV == 'development') console.log(JSON.stringify(data));
            const sourceName = `${source.name}_${layer.name}`;

            // Check if the source already exists
            if (map.getSource(sourceName)) {
                // Remove the source from the map
                map.removeLayer(`${sourceName}_polygons`);
                map.removeLayer(`${sourceName}_lines`);
                map.removeSource(sourceName);
            }

            // Add the source to the map
            map.addSource(sourceName, {
                type: 'geojson',
                generateId: true,
                lineMetrics: true,
                data: data as any
            });

            // Add the layer to the map
            map.addLayer({
                id: `${sourceName}_polygons`,
                type: 'fill',
                source: sourceName,
                metadata: { "source:comment": `EcoSensor data polygons for ${layer.name}` },
                paint: {
                    'fill-color': '#888888',
                    'fill-opacity': 0.4
                },
                filter: ['==', '$type', 'Polygon']
            });

            // Add the layer to the map
            map.addLayer({
                id: `${sourceName}_lines`,
                type: 'line',
                source: sourceName,
                metadata: { "source:comment": `EcoSensor data lines for ${layer.name}` },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#888',
                    'line-width': 8
                },
                filter: ['==', '$type', 'LineString']
            });
        });
    }, [map, reDrawMap]);

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