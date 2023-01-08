import { Paper, Group, Text, createStyles } from '@mantine/core'
import { IconArrowUpRight, IconArrowDownRight, TablerIcon } from '@tabler/icons'

const useStyles = createStyles((theme) => ({
  title: {
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  icon: {
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },
  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },
  diff: {
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },
}))

export const StatCard = ({
  title,
  diff,
  value,
  Icon,
}: {
  title: string
  diff: number
  value: number
  Icon: TablerIcon
}) => {
  const { classes } = useStyles()

  const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight

  console.log('DIFF', diff)

  return (
    <Paper withBorder p={'md'} radius={'md'} key={title}>
      <Group position={'apart'}>
        <Text size="xs" color={'dimmed'} className={classes.title}>
          {title}
        </Text>
        <Icon className={classes.icon} size={22} stroke={1.5} />
      </Group>

      <Group align="flex-end" spacing="xs" mt={25}>
        <Text className={classes.value}>{value}</Text>
        <Text
          color={diff > 0 ? 'teal' : 'red'}
          size="sm"
          weight={500}
          className={classes.diff}
        >
          <span>{diff}%</span>
          <DiffIcon size={16} stroke={1.5} />
        </Text>
      </Group>

      <Text size="xs" color="dimmed" mt={7}>
        W porównaniu z ostatnimi 30 dniami
      </Text>
    </Paper>
  )
}
