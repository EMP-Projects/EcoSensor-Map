'use client'

import { Progress, Table, ColorSwatch } from '@mantine/core';
import React from "react";
import _ from "lodash";
import {IEUAirQualityIndex} from "@/types";

export function EuIndexAirQuality() {

    const euAirQualityIndex : IEUAirQualityIndex[] = [
        { id: 1, color: '#47EEE0', name: 'Good' },
        { id: 2, color: '#44C39A', name: 'Fair' },
        { id: 3, color: '#ECE433', name: 'Moderate' },
        { id: 4, color: '#E8333C', name: 'Poor' },
        { id: 5, color: '#820026', name: 'Very Poor' },
        { id: 6, color: '#680D6D', name: 'Extremely Poor' },
    ];

    const rows = _.map(euAirQualityIndex, (element : IEUAirQualityIndex) => (
        <Table.Tr key={element.id}>
            <Table.Td><ColorSwatch color={element.color} /></Table.Td>
            <Table.Td>{element.name}</Table.Td>
        </Table.Tr>
    ));

    return (
        <Table withRowBorders={false}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
}