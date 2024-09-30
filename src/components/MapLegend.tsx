'use client'

import { Card, Group, Container, Title } from '@mantine/core';
import React from "react";
import {EuIndexAirQuality} from "@/components";
import {useEcoSensorContext} from "@/contexts";
import {getPollutionText} from "@/utils";

export function MapLegend() {

    const containerProps = {
        left: 0,
        h: 250,
        mt: 'md',
        position: 'relative',
        opacity: 0.8
    };

    const { pollutionSelected } = useEcoSensorContext();

    return (
        <div style={{ width: 250, left: 0, top: 60, height: 250, position: "absolute", zIndex: 9000 }}>
            <Container {...containerProps}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section>
                        <center>
                            <Title order={2}>{pollutionSelected ? getPollutionText(pollutionSelected) : ''}</Title>
                        </center>
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                        <EuIndexAirQuality />
                    </Group>

                    <Group justify="space-between" mt="md" mb="xs">

                    </Group>
                </Card>
            </Container>
        </div>
    );
}