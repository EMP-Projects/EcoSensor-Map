'use client'

import React, {useEffect, useMemo, useState} from 'react';
import { Popover, Button, Select } from '@mantine/core';
import {getPollutionDescriptions, getPollutionKeyByValue, getPollutionText} from "@/utils";
import {useEcoSensorContext} from "@/contexts";
import {EPollution} from "@/types";

export function Pollutions() {
    const [value, setValue] = useState<string | null>(null);
    const { pollutionSelected, setPollutionSelected } = useEcoSensorContext();

    const getValues = useMemo(() => {
        const recordsPollutants = getPollutionDescriptions();
        return Object.values(recordsPollutants);
    }, []);

    useEffect(() => {
        if (!value) return;
        setPollutionSelected(getPollutionKeyByValue(value))
    }, [value, setPollutionSelected]);

    return (
        <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
                <Button>Pollutant</Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Select
                    label="Choose Pollutant"
                    placeholder="Pick value"
                    data={getValues}
                    value={value ?? getPollutionText((pollutionSelected ?? EPollution.Pm25) as EPollution)}
                    comboboxProps={{ withinPortal: false }}
                    onChange={(_value, option) => setValue(option.value)}
                />
            </Popover.Dropdown>
        </Popover>
    );
}