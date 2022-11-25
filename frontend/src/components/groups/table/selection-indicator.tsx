import { Button, Menu } from '@mantine/core'
import {
  IconTrash,
  IconDotsVertical,
  IconSelect,
  IconUsers,
} from '@tabler/icons'

import { GroupsTableSelection } from './types'

export const SelectionIndicator = ({
  selection,
  clearSelection,
}: {
  selection: GroupsTableSelection[]
  clearSelection: () => void
}) => {
  if (selection.length === 0) {
    return null
  }

  return (
    <Menu trigger={'hover'} openDelay={100} closeDelay={400} shadow={'md'}>
      <Menu.Target>
        <Button
          color={'indigo'}
          leftIcon={<IconUsers size={16} />}
          rightIcon={<IconDotsVertical size={16} />}
        >
          {selection.length} {selection.length > 1 ? 'grupy' : 'grupa'}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconSelect size={14} />} onClick={clearSelection}>
          Wyczyść wybór
        </Menu.Item>
        <Menu.Item color={'red'} icon={<IconTrash size={14} />} disabled>
          Usuń wybrane
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
