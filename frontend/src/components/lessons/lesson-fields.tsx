import { Badge, Group, Button, Text } from '@mantine/core'
import { openModal, closeAllModals } from '@mantine/modals'
import { IconCheck, IconCircleHalf2, IconNotes, IconX } from '@tabler/icons'

import { LessonHomework, LessonPresence } from './types'

export const ViewLessonHomework = ({ status }: { status?: LessonHomework }) => {
  if (!status) {
    return null
  }

  if (status === LessonHomework.Done) {
    return (
      <Badge color={'teal'}>
        <Group spacing={4}>
          <IconCheck size={10} stroke={2} />
          Zrobiona
        </Group>
      </Badge>
    )
  } else if (status === LessonHomework.Partial) {
    return (
      <Badge color={'yellow'}>
        <Group spacing={4}>
          <IconCircleHalf2 size={10} stroke={2} />
          Częściowo
        </Group>
      </Badge>
    )
  } else {
    return (
      <Badge color={'red'}>
        <Group spacing={4}>
          <IconX size={10} stroke={2} />
          Brak
        </Group>
      </Badge>
    )
  }
}

export const ViewLessonPresence = ({ status }: { status: LessonPresence }) => {
  if (status === LessonPresence.Present) {
    return (
      <Badge color={'teal'}>
        <Group spacing={4}>
          <IconCheck size={10} stroke={2} />
          Tak
        </Group>
      </Badge>
    )
  } else if (status === LessonPresence.Late) {
    return (
      <Badge color={'yellow'}>
        <Group spacing={4}>
          <IconCircleHalf2 size={10} stroke={2} />
          Spóźnienie
        </Group>
      </Badge>
    )
  } else {
    return (
      <Badge color={'red'}>
        <Group spacing={4}>
          <IconX size={10} stroke={2} />
          Brak
        </Group>
      </Badge>
    )
  }
}

export const ViewLessonNote = ({ content }: { content?: string }) => {
  if (!content) {
    return null
  }

  return (
    <Button
      color={'cyan'}
      size={'sm'}
      variant={'subtle'}
      rightIcon={<IconNotes size={10} stroke={2} />}
      onClick={() =>
        openModal({
          title: 'Uwaga od nauczyciela',
          children: (
            <>
              <Text size={'sm'} weight={400} style={{ whiteSpace: 'pre-wrap' }}>
                {content}
              </Text>
              <Button mt={'xl'} onClick={() => closeAllModals()}>
                Zamknij
              </Button>
            </>
          ),
        })
      }
    >
      Przeczytaj uwagę
    </Button>
  )
}
