'use client'

import React from 'react';
import { Container, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Header.module.css';

export function Header() {
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}