import { UsersTable } from '../components/users/table'
import { PageLayout } from '../components/ui'

export const ManageUsersPage = () => {
  return (
    <PageLayout title={'Użytkownicy'}>
      <UsersTable />
    </PageLayout>
  )
}
