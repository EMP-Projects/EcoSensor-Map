'use client'

import {GeolocateControl, LngLat, LngLatBounds, Map, MapOptions, NavigationControl} from 'maplibre-gl';
import {DateTime} from 'luxon';

import {
    EPollution,
    EProjection,
    IAirQuality, IAirQualityData,
    IAirQualityLayer,
    IMapSource,
    IMapState,
    IOsm
} from "@/types";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import _ from 'lodash';
import {useMapContext, useEcoSensorContext} from "@/contexts";
import {
    fetchAirQualityDataAndConvertToWgs84,
    getArrayProperty,
    getNewColorScale,
    getProperty, IsIntersection
} from "@/utils";
import {useViewportSize} from '@mantine/hooks';
import {LoadingOverlay, Container} from "@mantine/core";
import {MapLegend} from "@/components/MapLegend";
import {toWgs84} from "@turf/projection";

export function MapEcoSensor(props: IMapState) {
    const [map, setMap] = useState<Map>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [position, setPosition] = useState<number[]>([]);
    const containerMapRef = useRef<HTMLDivElement>(null);
    const divMapRef = useRef<HTMLDivElement>(null);
    const { height } = useViewportSize();
    const { source } = props;

    const { pollutionSelected, setGeoJson, setExtentMap, extentMap } = useEcoSensorContext();

    // Get the map context
    const { setMapLibre, center } = useMapContext();

    // Initialize the geoLocate control.
    const geoLocate = useMemo(() => new GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }), []);

    const containerProps = {
        h: height - 60,
        left: 0,
        top: 0,
        fluid: true,
        padding: 0,
        margin: 0
    };

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
        if (!map || !center || center[0] <= 0 || center[1] <= 0) return;
        map.setCenter(new LngLat(center[0], center[1]));
    }, [map, center]);

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
     * Filters GeoJSON data to create an array of air quality layers.
     *
     * @param {any} geoJson - The GeoJSON data containing the features to filter.
     * @param {string} sourceName - The name of the source to associate with the layers.
     * @returns {IAirQualityLayer[]} An array of air quality layers.
     */
    const filterGeoJson = useCallback((geoJson: any, sourceName: string) : IAirQualityLayer[] => {

        const opacity = 0.3;

        // Filter the GeoJson data
        const layers : IAirQualityLayer[] = _.map(geoJson.features, (feature: any) => {
            // Get the OSM properties
            const propertyOsm : IOsm = getProperty<IOsm>(feature, "OSM");
            // Get the air quality properties
            const propertiesAirQuality : IAirQuality[] = getArrayProperty<IAirQuality>(feature, "Data") ;
            // Sort the air quality data by date
            const propertiesAirQualitySorted : IAirQuality[] = _.sortBy(propertiesAirQuality, (property: IAirQuality) => property.date);

            // Filter the air quality data to get the properties from today
            const propertiesAirQualityFromToday : IAirQuality[] = _.filter(propertiesAirQualitySorted, (property: IAirQuality) => {
                // Get the date in milliseconds
                const dateAq : number = DateTime.fromISO(property.date).toMillis();
                // Get the start and end date in milliseconds from now to 1 hour
                const dateStart : number = DateTime.now().toUTC().toMillis();
                // Get the end date in milliseconds from now to 1 hour
                const dateEnd : number = DateTime.now().plus({hours: 1}).toUTC().toMillis();
                // Return the properties from today
                return dateAq > dateStart && dateAq <= dateEnd;
            });

            // Get the air quality property with the highest value
            const propertyAirQualityNow : IAirQuality | undefined = _.maxBy(propertiesAirQualityFromToday, (property: IAirQuality) => property.europeanAqi);
            // Get the color based on the air quality value
            const color : string = !propertyAirQualityNow?.color || propertyAirQualityNow?.color == ""
                ? getNewColorScale(propertyAirQualityNow?.value ?? 0)
                : propertyAirQualityNow?.color;

            // Set the paint properties based on the geometry type
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
    }, []);

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

        if (!map || !source || _.size(source.layers) == 0) return;

        // Filter the layers based on the extent of the map
        const layersExtent = extentMap ? _.filter(source.layers, (layer: IAirQualityData) => {
            const polyLayerExtent = turf.bboxPolygon(layer.extent as number[]);
            const polyLayerExtentWgs84 = toWgs84(turf.feature(polyLayerExtent));
            return IsIntersection(turf.bbox(polyLayerExtentWgs84), [extentMap?.getSouthWest().lat as number, extentMap?.getSouthWest().lng as number, extentMap?.getNorthEast().lat as number, extentMap?.getNorthEast().lng as number]);
        }) : source.layers;
        const layers : IAirQualityData[] = _.filter(layersExtent, (layer: IAirQualityData) => layer.pollution as EPollution == pollutionSelected);

        if (_.size(layers) == 0) {
            console.log('No layers to display');
            return;
        }

        setIsLoading(true);
        // Set the GeoJson data to the context
        setGeoJson(source);

        _.forEach(layers, async (layer: IAirQualityData) => {

            // Fetch the data and convert it to WGS84
            const data = await fetchAirQualityDataAndConvertToWgs84(layer);

            // Filter the GeoJson data
            const layers = filterGeoJson(data, layer.entityKey);

            // Remove the layers from the map
            removeLayers(layers, layer.entityKey);

            // Add the source to the map
            map.addSource(layer.entityKey, {
                type: 'geojson',
                generateId: true,
                lineMetrics: true,
                data: data as any
            });

            // Add the layers to the map
            addLayers(layers, layer.entityKey);
        });

        setIsLoading(false);
    }, [map, addLayers, removeLayers, filterGeoJson, pollutionSelected, setGeoJson, extentMap]);

    useEffect(() => {
        if (!map || !source || !pollutionSelected) return;
        // Add the GeoJson to the map
        map.on('load', async () => await addGeoJson(source));
        map.on('zoomend', (e) => setExtentMap(e.target.getBounds() as LngLatBounds));
    }, [map, addGeoJson, setMapLibre, source, pollutionSelected, setExtentMap]);

    useEffect(() => {
        if (!pollutionSelected || !source || !map) return;
        addGeoJson(source).then(() => map.redraw());
    }, [addGeoJson, pollutionSelected, source, map]);

    return (
        <Container {...containerProps}>
            <LoadingOverlay visible={isLoading} />
            <MapLegend />
            <div ref={divMapRef} style={{ height: height - 60, position: "relative" }} />
        </Container>
    );
}