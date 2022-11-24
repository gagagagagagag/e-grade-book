import { useState } from 'react'
import { Button, Menu } from '@mantine/core'
import { countBy } from 'lodash'
import {
  IconUsers,
  IconSchool,
  IconUser,
  IconDotsVertical,
  IconTrash,
  IconPlus,
  IconHome,
  IconSelect,
} from '@tabler/icons'

import { CreateGroupModal } from '../../groups/data/group-modals'
import { AssignStudentsToTargetModal } from '../data/users-assign-modals'
import { UserRoles } from '../types'
import { UsersTableSelection } from './types'

export const SelectionIndicator = ({
  selection,
  clearSelection,
}: {
  selection: UsersTableSelection[]
  clearSelection: () => void
}) => {
  const [createGroupWithUsers, setCreateGroupWithUsers] = useState(false)
  const [assignToTeacher, setAssignToTeacher] = useState(false)
  const [assignToParent, setAssignToParent] = useState(false)

  if (selection.length === 0) {
    return null
  }

  const counts = countBy(selection, 'role')
  const isMixed =
    Object.values(counts).filter((count) => count !== 0).length > 1

  let button = (
    <Button
      leftIcon={<IconUsers size={16} />}
      rightIcon={<IconDotsVertical size={16} />}
    >
      {selection.length} Mieszanych
    </Button>
  )
  let menu = null
  if (!isMixed) {
    if (counts[UserRoles.Admin]) {
      const label =
        counts[UserRoles.Admin] > 1 ? 'Administratorów' : 'Administrator'

      button = (
        <Button
          color={'pink'}
          leftIcon={<IconUser size={16} />}
          rightIcon={<IconDotsVertical size={16} />}
        >
          {selection.length} {label}
        </Button>
      )
    } else if (counts[UserRoles.Teacher]) {
      const label = counts[UserRoles.Teacher] > 1 ? 'Nauczycieli' : 'Nauczyciel'

      button = (
        <Button
          color={'orange'}
          leftIcon={<IconSchool size={16} />}
          rightIcon={<IconDotsVertical size={16} />}
        >
          {selection.length} {label}
        </Button>
      )
    } else if (counts[UserRoles.Parent]) {
      const label = counts[UserRoles.Parent] > 1 ? 'Rodziców' : 'Rodzic'

      button = (
        <Button
          color={'teal'}
          leftIcon={<IconHome size={16} />}
          rightIcon={<IconDotsVertical size={16} />}
        >
          {selection.length} {label}
        </Button>
      )
    } else {
      const label = counts[UserRoles.Student] > 1 ? 'Uczniów' : 'Uczeń'

      button = (
        <Button
          color={'violet'}
          leftIcon={<IconUser size={16} />}
          rightIcon={<IconDotsVertical size={16} />}
        >
          {selection.length} {label}
        </Button>
      )
      menu = (
        <>
          <Menu.Item icon={<IconUsers size={14} />}>
            Przypisz do grupy
          </Menu.Item>
          <Menu.Item
            icon={<IconPlus size={14} />}
            onClick={() => setCreateGroupWithUsers(true)}
          >
            Stwórz grupę z
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            icon={<IconSchool size={14} />}
            onClick={() => setAssignToTeacher(true)}
          >
            Przypisz do nauczyciela
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            icon={<IconHome size={14} />}
            onClick={() => setAssignToParent(true)}
          >
            Przypisz do rodzica
          </Menu.Item>
          <Menu.Divider />
        </>
      )
    }
  }

  return (
    <>
      <CreateGroupModal
        opened={createGroupWithUsers}
        withStudents={selection.map((selected) => selected._id)}
        onClose={(success) => {
          setCreateGroupWithUsers(false)
          if (success) {
            clearSelection()
          }
        }}
      />
      <AssignStudentsToTargetModal
        target={'teacher'}
        opened={assignToTeacher}
        onClose={(success) => {
          setAssignToTeacher(false)
          if (success) {
            clearSelection()
          }
        }}
        studentIds={selection.map((selected) => selected._id)}
      />
      <AssignStudentsToTargetModal
        target={'parent'}
        opened={assignToParent}
        onClose={(success) => {
          setAssignToParent(false)
          if (success) {
            clearSelection()
          }
        }}
        studentIds={selection.map((selected) => selected._id)}
      />
      <Menu trigger={'hover'} openDelay={100} closeDelay={400} shadow={'md'}>
        <Menu.Target>{button}</Menu.Target>
        <Menu.Dropdown>
          {menu}

          <Menu.Item icon={<IconSelect size={14} />} onClick={clearSelection}>
            Wyczyść wybór
          </Menu.Item>
          <Menu.Item color={'red'} icon={<IconTrash size={14} />}>
            Usuń wybrane
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
