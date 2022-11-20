import { useCurrentUser } from '../components/auth/hooks'
import { PageLayout } from '../components/ui'

export const DashboardPage = () => {
  const user = useCurrentUser()

  return (
    <PageLayout title={`Witaj, ${user.name}👋🏻`}>
      <span style={{ display: 'inline-block', marginBottom: '4000px' }}>
        Dashboard
      </span>
    </PageLayout>
  )
}
