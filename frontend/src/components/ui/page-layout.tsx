import React, { useEffect, useRef } from 'react'
import { ActionIcon, Container, Group, Title } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  navigationPush,
  navigationPop,
  useAppDispatch,
  useAppSelector,
  navigationClear,
} from '../../store'

export interface PageLayoutProps {
  title: string
  canGoBack: boolean
  clearNavigation: boolean
  children: React.ReactNode
}

export const PageLayout = ({
  title,
  clearNavigation,
  canGoBack,
  children,
}: PageLayoutProps) => {
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()
  const navigationCleared = useRef(false)

  useEffect(() => {
    if (clearNavigation && !navigationCleared.current) {
      dispatch(navigationClear())
      dispatch(navigationPush(pathname))
      navigationCleared.current = true
    }
  }, [dispatch, clearNavigation, pathname])

  return (
    <>
      <Group mb={'xl'}>
        {canGoBack && <NavigationButton />}
        <Title order={1} size={'h2'}>
          {title}
        </Title>
      </Group>
      <Container size={'xl'}>{children}</Container>
    </>
  )
}

const NavigationButton = React.memo(() => {
  const navigationPushed = useRef(false)
  const pageBefore = useAppSelector((state) => state.navigation.pageBefore)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!navigationPushed.current) {
      dispatch(navigationPush(pathname))
      navigationPushed.current = true
    }
  }, [dispatch, pathname])

  if (!pageBefore) {
    return null
  }

  const goBackHandler = () => {
    dispatch(navigationPop())
    navigate(pageBefore)
  }

  return (
    <ActionIcon onClick={goBackHandler}>
      <IconChevronLeft size={16} />
    </ActionIcon>
  )
})
