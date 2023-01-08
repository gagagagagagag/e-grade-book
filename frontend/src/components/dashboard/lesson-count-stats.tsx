import { SimpleGrid } from '@mantine/core'
import { IconClockHour3, IconChalkboard } from '@tabler/icons'

import { StatCard } from './stat-card'
import { DashboardData } from './types'
import { getDiff } from './utils'

export const LessonCountStats = ({
  current,
  last,
}: DashboardData['lessons']) => {
  if (!current || !last) {
    return null
  }

  if (last.totalLessons === 0 || last.totalDuration === 0) {
    return null
  }

  return (
    <SimpleGrid
      cols={4}
      breakpoints={[
        { maxWidth: 'md', cols: 2 },
        { maxWidth: 'xs', cols: 1 },
      ]}
    >
      <StatCard
        title={'Lekcje'}
        Icon={IconChalkboard}
        diff={getDiff(current.totalDuration, last.totalDuration)}
        value={current.totalLessons}
      />
      <StatCard
        title={'Minut lekcji'}
        Icon={IconClockHour3}
        diff={getDiff(current.totalDuration, last.totalDuration)}
        value={current.totalDuration}
      />
    </SimpleGrid>
  )
}
