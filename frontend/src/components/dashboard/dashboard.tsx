import { Loader, Stack } from '@mantine/core'

import { ErrorAlert } from '../ui'
import { LessonCountStats } from './lesson-count-stats'
import { LessonStats } from './lesson-stats'
import { useMyDashboard } from './hooks'

export const Dashboard = () => {
  const { data, error, isValidating } = useMyDashboard()

  if (isValidating) {
    return <Loader />
  }

  if (error) {
    return <ErrorAlert message={error} />
  }

  return (
    <>
      <Stack spacing={'md'}>
        <LessonCountStats
          current={data?.lessons.current}
          last={data?.lessons.last}
        />
        <LessonStats
          current={data?.lessons.current}
          last={data?.lessons.last}
        />
      </Stack>
    </>
  )
}
