import { useState } from 'react'
import { Popover, Button, Stack, Divider } from '@mantine/core'
import { IconClearAll, IconFilter, IconFilterOff } from '@tabler/icons'

import { TableFiltersProps } from './types'

export const TableFilters = ({
  active,
  onReset,
  children,
}: TableFiltersProps) => {
  const [opened, setOpened] = useState(false)

  return (
    <Popover
      opened={opened}
      position={'bottom-end'}
      onClose={() => setOpened(false)}
    >
      <Popover.Target>
        <Button
          variant={active ? 'gradient' : 'light'}
          leftIcon={
            active ? <IconFilter size={16} /> : <IconFilterOff size={16} />
          }
          onClick={() => setOpened((prev) => !prev)}
        >
          Filtry
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          {children}
          {active && (
            <>
              <Divider />
              <Button
                size={'sm'}
                leftIcon={<IconClearAll size={16} />}
                variant={'light'}
                onClick={() => {
                  onReset()
                  setOpened(false)
                }}
              >
                Wyczyść
              </Button>
            </>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}
