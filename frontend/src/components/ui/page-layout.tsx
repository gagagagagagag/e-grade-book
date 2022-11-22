import { Container, Group, Title } from '@mantine/core'
import React from 'react'

export interface PageLayoutProps {
  title: string
  children: React.ReactNode
}

export const PageLayout = ({ title, children }: PageLayoutProps) => {
  return (
    <>
      <Group mb={'xl'}>
        <Title order={1} size={'h2'}>
          {title}
        </Title>
      </Group>
      <Container size={'xl'}>{children}</Container>
    </>
  )
}
