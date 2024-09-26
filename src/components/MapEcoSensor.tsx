'use client'

import {GeolocateControl, LngLat, LngLatBounds, Map, MapOptions, NavigationControl} from 'maplibre-gl';
import {DateTime} from 'luxon';

import {
    EPollution,
    EProjection,
    IAirQuality,
    IAirQualityLayer,
    IConfiguration,
    IMapSource,
    IMapState,
    IOsm
} from "@/types";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import _ from 'lodash';
import {useMapContext, useEcoSensorContext} from "@/contexts";
import {fetchDataAndConvertToWgs84, getArrayProperty, getNewColorScale, getProperty} from "@/utils";
import {useViewportSize} from '@mantine/hooks';

export function MapEcoSensor(props: IMapState) {
    const [map, setMap] = useState<Map>();
    const [position, setPosition] = useState<number[]>([]);
    const containerMapRef = useRef<HTMLDivElement>(null);
    const divMapRef = useRef<HTMLDivElement>(null);
    const { height, width } = useViewportSize();
    const { source } = props;

    const { pollutionSelected } = useEcoSensorContext();

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

    const filterGeoJson = useCallback((geoJson: any, sourceName: string) : IAirQualityLayer[] => {

        const opacity = 0.3;

        const layers : IAirQualityLayer[] = _.map(geoJson.features, (feature: any) => {
            const propertyOsm : IOsm = getProperty<IOsm>(feature, "OSM");
            const propertiesAirQuality : IAirQuality[] = getArrayProperty<IAirQuality>(feature, "Data") ;
            const propertiesAirQualitySorted : IAirQuality[] = _.sortBy(propertiesAirQuality, (property: IAirQuality) => property.date);

            const propertiesAirQualityFromToday : IAirQuality[] = _.filter(propertiesAirQualitySorted, (property: IAirQuality) => {
                const dateAq : number = DateTime.fromISO(property.date).toMillis();
                const dateStart : number = DateTime.now().toUTC().toMillis();
                const dateEnd : number = DateTime.now().plus({hours: 1}).toUTC().toMillis();
                return dateAq > dateStart && dateAq <= dateEnd && property.pollution == (pollutionSelected ?? EPollution.Pm25);
            });

            const propertyAirQualityNow : IAirQuality | undefined = _.maxBy(propertiesAirQualityFromToday, (property: IAirQuality) => property.europeanAqi);
            const color : string = propertyAirQualityNow?.color ?? getNewColorScale(propertyAirQualityNow?.value ?? 0);

            const paint: any = feature.geometry.type === 'Polygon'
                ? {
                    'fill-color': color,
                    'fill-opacity': opacity
                } : {
                    'line-color': color,
                    'line-width': 1,
                    'line-opacity': opacity,
                };

            return {
                layerName : `${sourceName}_${propertyOsm.id}`,
                typeLayer : feature.geometry.type === 'Polygon' ? 'fill' : 'line',
                paint: paint,
                typeGeometry: feature.geometry.type,
                airQuality : propertyAirQualityNow
            }
        });

        const layersFiltered : IAirQualityLayer[] = _.filter(layers, (layer: IAirQualityLayer) => layer.airQuality != null);
        return _.sortBy(layersFiltered, (layer: IAirQualityLayer) => layer.airQuality?.europeanAqi);
    }, [pollutionSelected]);

    /**
     * Adds layers to the map based on the provided GeoJSON data.
     *
     * @param {Map} map - The MapLibre GL map instance.
     * @param {string} sourceName - The name of the source to add layers to.
     * @param {any} geoJson - The GeoJSON data containing the features to add.
     */
    const addLayers = useCallback((layers: IAirQualityLayer[], sourceName: string) : void => {

        if (!map) return;

        _.forEach(layers, (layer: IAirQualityLayer) => {

            const configLayer: any = {
                id: layer.layerName,
                type: layer.typeLayer,
                source: sourceName,
                metadata: {"source:comment": `EcoSensor data for ${layer.layerName}`},
                paint: layer.paint,
            }

            if (layer.typeGeometry === 'LineString') {
                configLayer['layout'] = {
                    'line-join': 'round',
                    'line-cap': 'round'
                };
            }

            map.addLayer(configLayer);
        });
    }, [map]);

    /**
     * Removes layers from the map based on the provided GeoJSON data.
     *
     * @param {Map} map - The MapLibre GL map instance.
     * @param {string} sourceName - The name of the source to remove layers from.
     * @param {any} geoJson - The GeoJSON data containing the features to remove.
     */
    const removeLayers = useCallback((layers: IAirQualityLayer[], sourceName: string) => {

        if (!map) return;

        // Remove the layers from the map
        _.forEach(layers, (layer: IAirQualityLayer) => {
            if (map.getLayer(layer.layerName))
                map.removeLayer(layer.layerName);
        });

        // Remove the source from the map
        if (map.getSource(sourceName))
            map.removeSource(sourceName);

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
            const data = await fetchDataAndConvertToWgs84(layer.id, layer.type);

            // Set the source name
            const sourceName : string = `${source.name}_${layer.id}`;

            // Filter the GeoJson data
            const layers = filterGeoJson(data, sourceName);

            // Remove the layers from the map
            removeLayers(layers, sourceName);

            // Add the source to the map
            map.addSource(sourceName, {
                type: 'geojson',
                generateId: true,
                lineMetrics: true,
                data: data as any
            });

            // Add the layers to the map
            addLayers(layers, sourceName);
        });
    }, [map, addLayers, removeLayers, filterGeoJson]);

    useEffect(() => {
        if (!map || !source) return;
        // Add the GeoJson to the map
        map.on('load', async () => await addGeoJson(source));
    }, [map, addGeoJson, setMapLibre, source, pollutionSelected]);

    useEffect(() => {
        if (!pollutionSelected || !source || !map) return;
        console.log(`Pollution selected: ${pollutionSelected}`);
        addGeoJson(source).then(() => console.log(`GeoJson added`));
    }, [addGeoJson, pollutionSelected, source, map]);

    return (
        <>
            <div ref={containerMapRef}>
                <div ref={divMapRef} style={{ width: width, height: height - 56, position: 'relative' }} />
            </div>
        </>
    );
}