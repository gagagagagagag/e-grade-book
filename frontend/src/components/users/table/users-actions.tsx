import { useState } from 'react'
import { Group, Menu, ActionIcon } from '@mantine/core'
import {
  IconPencil,
  IconDots,
  IconMailForward,
  IconTrash,
  IconEye,
  IconHome,
  IconSchool,
} from '@tabler/icons'

import { useSendPasswordEmailByAdmin } from '../../auth/hooks'
import { EditUserModal } from '../data/user-modals'
import { User, UserRoles } from '../types'
import { AssignStudentsToTargetModal } from '../data/users-assign-modals'

export const UsersActions = ({
  user,
  onEdit,
}: {
  user: User
  onEdit: (updatedUser: User) => void
}) => {
  const sendPassowordEmail = useSendPasswordEmailByAdmin()
  const [editUser, setEditUser] = useState(false)
  const [assignToTeacher, setAssignToTeacher] = useState(false)
  const [assignToParent, setAssignToParent] = useState(false)

  if (user.role === UserRoles.Admin) {
    return null
  }

  return (
    <>
      <EditUserModal
        opened={editUser}
        onClose={(updatedUser) => {
          setEditUser(false)
          if (updatedUser) {
            onEdit(updatedUser)
          }
        }}
        user={user}
      />
      <AssignStudentsToTargetModal
        target={'teacher'}
        opened={assignToTeacher}
        onClose={() => setAssignToTeacher(false)}
        studentIds={[user._id]}
      />
      <AssignStudentsToTargetModal
        target={'parent'}
        opened={assignToParent}
        onClose={() => setAssignToParent(false)}
        studentIds={[user._id]}
      />
      <Group spacing={0} position="right">
        <ActionIcon>
          <IconEye size={16} stroke={1.5} />
        </ActionIcon>
        <Menu transition="pop" withArrow position="bottom-end">
          <Menu.Target>
            <ActionIcon>
              <IconDots size={16} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              icon={<IconPencil size={16} stroke={1.5} />}
              onClick={() => setEditUser(true)}
            >
              Edytuj
            </Menu.Item>
            <Menu.Item
              icon={<IconMailForward size={16} stroke={1.5} />}
              onClick={() =>
                sendPassowordEmail(user._id, user.passwordInitiated)
              }
            >
              {user.passwordInitiated
                ? 'Wyślij maila do resetu hasła'
                : 'Wyślij maila do aktywacji konta'}
            </Menu.Item>
            {user.role === UserRoles.Student && (
              <>
                <Menu.Divider />
                <Menu.Item
                  icon={<IconSchool size={16} stroke={1.5} />}
                  onClick={() => setAssignToTeacher(true)}
                >
                  Przypisz do nauczyciela
                </Menu.Item>
                <Menu.Item
                  icon={<IconHome size={16} stroke={1.5} />}
                  onClick={() => setAssignToParent(true)}
                >
                  Przypisz do rodzica
                </Menu.Item>
              </>
            )}
            <Menu.Divider />
            <Menu.Item icon={<IconTrash size={16} stroke={1.5} />} color="red">
              Usuń
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </>
  )
}
