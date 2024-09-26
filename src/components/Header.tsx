'use client'

import React from 'react';
import { Container, Burger, Text, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Header.module.css';
import {Pollutions} from "@/components/Pollutions";

export function Header() {
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <Text size="xl">EcoSensor</Text>
                <Group gap={5} visibleFrom="xs">
                    <Pollutions />
                </Group>
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}