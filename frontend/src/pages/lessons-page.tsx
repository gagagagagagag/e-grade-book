import { LessonsTable } from '../components/lessons/table'
import { PageLayout } from '../components/ui'

export const LessonsPage = () => {
  return (
    <PageLayout title={'Lekcje'} canGoBack={false} clearNavigation>
      <LessonsTable />
    </PageLayout>
  )
}
