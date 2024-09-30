'use client'

import {useEcoSensorContext, useMapContext} from "@/contexts";
import React, {useEffect, useState} from "react";
import {MapEcoSensor} from "@/components";
import * as turf from "@turf/turf";
import {toWgs84} from "@turf/projection";
import _ from "lodash";
import {fetchAirQualityData} from "@/utils";
import {IAirQualityData} from "@/types";
import {LoadingOverlay} from "@mantine/core";

export default function Home() {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        zoom,
        style,
        projection,
        extent,
        containerMapRef,
        center,
        setCenter
    } = useMapContext();

    const { setAirQualityData, airQualityData } = useEcoSensorContext();

    /**
     * Initializes the EcoSensor by fetching air quality data and setting the state.
     *
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    useEffect(()=> {
        // If air quality data already exists, do nothing
        if (airQualityData) return;

        // Set loading state to true
        setIsLoading(true);

        // Fetch air quality data
        fetchAirQualityData().then((configData) => {
            if (configData) {
                // Map and convert the center point of each configuration to Web Mercator
                const newConfigData = _.map(configData as IAirQualityData[], (config: IAirQualityData) => {
                    // Convert the center point to Web Mercator
                    const pt = turf.point(config.center as number[]);
                    const ptToWgs84 = toWgs84(pt);
                    // Return the new configuration with updated center coordinates
                    return {
                        ...config,
                        center: ptToWgs84.geometry.coordinates,
                    }
                });
                // Set the new air quality data
                setAirQualityData(newConfigData);
                // Set the center to the first configuration's center
                setCenter!(newConfigData[0].center);
            }
            setIsLoading(false);
        }).catch((error) => {
            console.error(error);
            setIsLoading(false);
        });

    }, [airQualityData, setAirQualityData, setCenter]);

    return (
      <>
          <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
          <MapEcoSensor zoom={zoom}
                      center={center}
                      extent={extent}
                      containerMapRef={containerMapRef}
                      source={{
                          url: process.env.api ?? '',
                          name: "ecoSensor",
                          layers: airQualityData
                      }}
                      style={style}
                      projection={projection}></MapEcoSensor>
      </>
    );
}
