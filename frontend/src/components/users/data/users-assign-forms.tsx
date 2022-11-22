import { Button, Group, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { validateMongoId } from '../../../utils/custom-validators'
import { AllTeachersSelect } from '../all-users-select'

export type AssignUsersToTeacherFormResult = {
  teacherId: string
}

export const AssignUsersToTeacherForm = ({
  loading,
  onSubmit,
  notContainingStudents,
}: {
  loading: boolean
  onSubmit: (data: AssignUsersToTeacherFormResult) => void
  notContainingStudents: string[]
}) => {
  const form = useForm({
    initialValues: {
      teacherId: '',
    },
    validate: {
      teacherId: validateMongoId,
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing={'md'}>
        <AllTeachersSelect
          label={'Nauczyciel'}
          variant={'filled'}
          notContainingStudents={notContainingStudents}
          {...form.getInputProps('teacherId')}
        />
      </Stack>
      <Group spacing={'md'} position={'right'} mt={'md'}>
        <Button type={'submit'} loading={loading}>
          Zapisz
        </Button>
      </Group>
    </form>
  )
}

export const AssignUsersToParentForm = () => {}
