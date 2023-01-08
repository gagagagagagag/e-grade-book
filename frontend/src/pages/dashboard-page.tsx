import { useCurrentUser } from '../components/auth/hooks'
import { Dashboard } from '../components/dashboard'
import { PageLayout } from '../components/ui'

export const DashboardPage = () => {
  const user = useCurrentUser()

  return (
    <PageLayout
      title={`Witaj, ${user.name}👋🏻`}
      canGoBack={false}
      clearNavigation
    >
      <Dashboard />
    </PageLayout>
  )
}
