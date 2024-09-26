import type { Metadata } from "next";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import "mapbox-gl-infobox/styles.css";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import React from "react";
import {Header} from "@/components";

export const metadata: Metadata = {
  title: "EcoSensor",
  description: "Monitor environmental data in real-time.",
};

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
      return (
        <html lang="en">
          <head>
            {<ColorSchemeScript />}
            <title>EcoSensor</title>
          </head>
          <body>
            <MantineProvider>
                <Header />
                {children}
            </MantineProvider>
          </body>
        </html>
      );
}
