import { SimpleGrid } from '@mantine/core'
import { IconBook } from '@tabler/icons'

import { BreakdownCard } from './breakdown-card'
import { DashboardData } from './types'
import { getDiff } from './utils'

export const LessonStats = ({ current, last }: DashboardData['lessons']) => {
  if (!current || !last) {
    return null
  }

  return (
    <SimpleGrid cols={1} breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
      <BreakdownCard
        title={'Obecność'}
        Icon={IconBook}
        diff={getDiff(current.totalAttendance, last.totalAttendance)}
        total={`${current.totalAttendance}`}
        data={[
          {
            count: '46',
            color: 'teal',
            label: 'OK',
            part: 23,
          },
          {
            count: '100',
            color: 'yellow',
            label: 'Spóźnienie',
            part: 50,
          },
          {
            count: '54',
            color: 'red',
            label: 'Brak',
            part: 27,
          },
        ]}
      />
    </SimpleGrid>
  )
}
