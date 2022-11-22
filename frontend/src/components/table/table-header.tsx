import React from 'react'
import { intersectionBy } from 'lodash'
import {
  UnstyledButton,
  Text,
  Center,
  Group,
  Checkbox,
  createStyles,
} from '@mantine/core'
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons'
import {
  IntegratedTableSelection,
  IntegratedTableSelectionHandler,
} from './types'

export interface TableHeaderProps {
  children: React.ReactNode
  reversed: boolean
  sortable: boolean
  sorted: boolean
  onSort?: React.MouseEventHandler<HTMLButtonElement>
}

const useStyles = createStyles((theme) => ({
  th: {
    padding: '0 !important',
  },
  actionsTh: {
    width: '100px',
    textAlign: 'center',
  },
  control: {
    cursor: 'default',
    width: '100%',
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
  },
  controlHover: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}))

export const TableHeaderContainer = ({
  isActions,
  colSpan,
  children,
}: {
  isActions: boolean
  colSpan: number
  children: React.ReactNode
}) => {
  const { classes, cx } = useStyles()

  return (
    <th
      className={cx(classes.th, isActions && classes.actionsTh)}
      colSpan={colSpan}
    >
      {children}
    </th>
  )
}

export const TableHeader = ({
  reversed,
  sortable,
  sorted,
  onSort,
  children,
}: TableHeaderProps) => {
  const { classes, cx } = useStyles()
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector
  return (
    <UnstyledButton
      onClick={onSort}
      className={cx(classes.control, sortable && classes.controlHover)}
    >
      <Group position={'apart'}>
        <Text weight={500} size={'sm'}>
          {children}
        </Text>
        {sortable && (
          <Center className={classes.icon}>
            <Icon size={14} stroke={1.5} />
          </Center>
        )}
      </Group>
    </UnstyledButton>
  )
}

export const TableSelectHeader = ({
  data,
  selection,
  onChangeSelection,
}: {
  data?: any[]
  selection?: IntegratedTableSelection
  onChangeSelection?: IntegratedTableSelectionHandler<any>
}) => {
  const { classes, cx } = useStyles()

  if (!selection || !onChangeSelection || !data) {
    return null
  }

  const selectedOnPage = intersectionBy(data, selection ?? [], '_id')
  const checked = selectedOnPage.length === data.length

  return (
    <th
      className={cx(classes.th)}
      style={{ width: '50px', textAlign: 'center' }}
    >
      <Checkbox
        checked={checked}
        indeterminate={selectedOnPage.length > 0 && !checked}
        onChange={() => onChangeSelection(data, checked ? 'remove' : 'add')}
        transitionDuration={0}
      />
    </th>
  )
}
