import { Outlet } from 'react-router-dom'
import { Grid, Stack, Text, Paper } from '@mantine/core'

import { Logo } from '../logo'

export const AuthLayout = () => {
  return (
    <Grid m={0} h={'100vh'} justify={'center'} align={'center'} columns={12}>
      <Grid.Col xs={10} md={4} xl={3}>
        <Stack justify={'center'} align={'center'}>
          <Logo />
          <Paper shadow={'sm'} p={'sm'} mt={'md'} radius={'md'} w={'100%'}>
            <Outlet />
          </Paper>
        </Stack>
      </Grid.Col>
      <Grid.Col
        span={12}
        sx={(theme) => ({
          alignSelf: 'end',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: theme.spacing.md,
        })}
      >
        <Text
          variant={'link'}
          size={'sm'}
          weight={400}
          onClick={() =>
            window.open(
              'https://www.ambitni.edu.pl/polityka-prywatnosci/',
              '_blank'
            )
          }
        >
          Polityka prywatności
        </Text>
        <Text variant={'link'} size={'sm'} weight={400}>
          Regulamin
        </Text>
      </Grid.Col>
    </Grid>
  )
}
