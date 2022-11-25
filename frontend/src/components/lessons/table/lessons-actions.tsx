import { ActionIcon, Group, Menu } from '@mantine/core'
import { IconDots, IconPencil, IconTrash } from '@tabler/icons'

import { LessonWithUsers } from '../types'

export const LessonsActions = ({ lesson }: { lesson: LessonWithUsers }) => {
  return (
    <>
      <Group spacing={0} position={'right'}>
        <ActionIcon>
          <IconPencil size={16} stroke={1.5} />
        </ActionIcon>
        <Menu transition={'pop'} position={'bottom-end'} withArrow>
          <Menu.Target>
            <ActionIcon>
              <IconDots size={16} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              icon={<IconTrash size={16} stroke={1.5} />}
              color={'red'}
              disabled
            >
              Usuń
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </>
  )
}
