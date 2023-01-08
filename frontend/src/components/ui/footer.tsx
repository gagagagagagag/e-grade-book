import { DateTime } from 'luxon'
import { createStyles, Text, Stack, Group } from '@mantine/core'

import { Session } from '../auth'

const useStyles = createStyles((theme) => ({
  footer: {
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBlock: theme.spacing.md,
    paddingInline: theme.spacing.lg,

    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column',
    },
  },
}))

export const Footer = () => {
  const { classes } = useStyles()

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        <Text size={'xs'}>
          Copyright {DateTime.now().toFormat('yyyy')} © Szkoła programowania i
          informatyki Ambitni
        </Text>
        <Session />
      </div>
    </div>
  )
}
