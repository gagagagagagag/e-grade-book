import { ActionIcon, Group, Menu } from '@mantine/core'
import { IconDots, IconEye, IconPencil, IconTrash } from '@tabler/icons'
import { useState } from 'react'
import { EditGroupModal } from '../data/group-modals'

import { Group as GroupType, GroupWithStudents } from '../types'

export const GroupsActions = ({
  group,
  onEdit,
}: {
  group: GroupType
  onEdit: (updatedGroup: GroupWithStudents) => void
}) => {
  const [editGroup, setEditGroup] = useState(false)

  return (
    <>
      <EditGroupModal
        group={group}
        opened={editGroup}
        onClose={(updatedGroup) => {
          setEditGroup(false)
          if (updatedGroup) {
            onEdit(updatedGroup)
          }
        }}
      />
      <Group spacing={0} position={'right'}>
        <ActionIcon>
          <IconEye size={16} stroke={1.5} />
        </ActionIcon>
        <Menu transition={'pop'} position={'bottom-end'} withArrow>
          <Menu.Target>
            <ActionIcon>
              <IconDots size={16} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              icon={<IconPencil size={16} stroke={1.5} />}
              onClick={() => setEditGroup(true)}
            >
              Edytuj
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              icon={<IconTrash size={16} stroke={1.5} />}
              color={'red'}
            >
              Usuń
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </>
  )
}
