'use client'

import {useMapContext} from "@/contexts";
import {useMemo} from "react";
import {IConfiguration} from "@/types";
import configData from "@/config-data.json";
import {MapEcoSensor} from "@/components";
import * as turf from "@turf/turf";
import {toMercator} from "@turf/projection";
import _ from "lodash";

export default function Home() {

  const {
    zoom,
    style,
    projection,
    extent,
    containerMapRef
  } = useMapContext();

  const configDataToWebMercator : IConfiguration[] = useMemo(() => _.map(configData as IConfiguration[], (config: IConfiguration) => {
      // Convert the center point to Web Mercator
      const pt = turf.point(config.center as number[]);
      const ptToMercator = toMercator(pt);
      // Return the new configuration
      return {
          ...config,
          center: ptToMercator.geometry.coordinates,
      }
  }), []);

  return (
      <>
        <MapEcoSensor zoom={zoom}
                      center={[configData[0].center[1], configData[0].center[0]]}
                      extent={extent}
                      containerMapRef={containerMapRef}
                      source={{
                          url: process.env.api ?? '',
                          name: "ecoSensor",
                          layers: configDataToWebMercator
                      }}
                      style={style}
                      projection={projection}></MapEcoSensor>
      </>
  );
}
