import { Outlet } from 'react-router-dom'
import { AppShell, createStyles } from '@mantine/core'

import { Sidebar } from './sidebar'
import { Footer } from './footer'

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  contents: {
    flex: '1',
    overflowY: 'auto',
    padding: theme.spacing.md,
  },
}))

export const AppLayout = () => {
  const { classes } = useStyles()

  return (
    <AppShell
      sx={() => ({
        root: {
          height: '100vh',
        },
      })}
      padding={0}
      navbar={<Sidebar />}
    >
      <div className={classes.container}>
        <div className={classes.contents}>
          <Outlet />
        </div>
        <Footer />
      </div>
    </AppShell>
  )
}
