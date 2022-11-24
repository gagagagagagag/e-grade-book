import { Button, Group, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'

import { validateMongoId } from '../../../utils/custom-validators'
import { AllGroupsSelect } from '../../groups/all-groups-select'
import { AllParentsSelect, AllTeachersSelect } from '../all-users-select'
import { AssignTarget } from './users-assign-modals'

export type AssignStudentsToTargetFormResult = {
  targetId: string
}

export const AssignStudentsToTargetForm = ({
  target,
  loading,
  onSubmit,
  notContainingStudents,
}: {
  target: AssignTarget
  loading: boolean
  onSubmit: (data: AssignStudentsToTargetFormResult) => void
  notContainingStudents: string[]
}) => {
  const form = useForm({
    initialValues: {
      targetId: '',
    },
    validate: {
      targetId: validateMongoId,
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing={'md'}>
        {target === 'parent' ? (
          <AllParentsSelect
            label={'Rodzic'}
            variant={'filled'}
            notContainingStudents={notContainingStudents}
            {...form.getInputProps('targetId')}
          />
        ) : target === 'teacher' ? (
          <AllTeachersSelect
            label={'Nauczyciel'}
            variant={'filled'}
            notContainingStudents={notContainingStudents}
            {...form.getInputProps('targetId')}
          />
        ) : (
          <AllGroupsSelect
            label={'Grupa'}
            variant={'filled'}
            notContainingStudents={notContainingStudents}
            {...form.getInputProps('targetId')}
          />
        )}
      </Stack>
      <Group spacing={'md'} position={'right'} mt={'md'}>
        <Button type={'submit'} loading={loading}>
          Zapisz
        </Button>
      </Group>
    </form>
  )
}
