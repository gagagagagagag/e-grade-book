import { Group, Menu, ActionIcon } from '@mantine/core'
import {
  IconPencil,
  IconDots,
  IconMailForward,
  IconTrash,
  IconEye,
  IconUserPlus,
} from '@tabler/icons'

import { User, UserRoles } from '../types'

export const UsersActions = ({ user }: { user: User }) => {
  return (
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
          <Menu.Item icon={<IconPencil size={16} stroke={1.5} />}>
            Edytuj
          </Menu.Item>
          <Menu.Item icon={<IconMailForward size={16} stroke={1.5} />}>
            {user.passwordInitiated
              ? 'Wyślij maila do resetu hasła'
              : 'Wyślij maila do aktywacji konta'}
          </Menu.Item>
          {user.role === UserRoles.Student && (
            <Menu.Item icon={<IconUserPlus size={16} stroke={1.5} />}>
              Przypisz do
            </Menu.Item>
          )}
          {user.role !== UserRoles.Admin && (
            <>
              <Menu.Divider />
              <Menu.Item
                icon={<IconTrash size={16} stroke={1.5} />}
                color="red"
              >
                Usuń
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}
