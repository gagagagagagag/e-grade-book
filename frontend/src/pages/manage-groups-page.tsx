import { GroupsTable } from '../components/groups/table'
import { PageLayout } from '../components/ui'

export const ManageGroupsPage = () => {
  return (
    <PageLayout title={'Grupy'} canGoBack={false} clearNavigation>
      <GroupsTable />
    </PageLayout>
  )
}
