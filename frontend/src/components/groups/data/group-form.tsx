import { Stack, TextInput, Group, Button, Checkbox } from '@mantine/core'
import { useForm } from '@mantine/form'

import {
  validateArrayNotEmpty,
  validateRequired,
} from '../../../utils/custom-validators'
import {
  AllStudentsMultiSelect,
  AllTeachersSelect,
} from '../../users/all-users-select'
import { Group as GroupType } from '../types'

export type GroupFormResult = Pick<GroupType, 'name' | 'students'> & {
  addStudents: boolean
  addTeacher: boolean
  teacher?: string
}

export type GroupFormProps = {
  loading: boolean
  initialValues?: GroupFormResult
  onSubmit: (data: GroupFormResult) => void
  isEditing: boolean
}

export const GroupForm = ({
  loading,
  initialValues = { name: '', addStudents: false, addTeacher: false },
  onSubmit,
  isEditing,
}: GroupFormProps) => {
  const form = useForm({
    initialValues: {
      ...initialValues,
      students: initialValues.students || [],
      teacher: initialValues.teacher || '',
    },
    validate: {
      name: validateRequired,
      students: (value, { addStudents }) => {
        if (addStudents) {
          return validateArrayNotEmpty(value)
        }

        return null
      },
      teacher: (value, { addTeacher }) => {
        if (addTeacher) {
          return validateRequired(value)
        }

        return null
      },
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing={'md'}>
        <TextInput
          label={'Nazwa'}
          variant={'filled'}
          {...form.getInputProps('name')}
        />
        {!isEditing && (
          <>
            <Checkbox
              label={'Dodaj uczniów do grupy'}
              {...form.getInputProps('addStudents', { type: 'checkbox' })}
            />
            {form.values.addStudents && (
              <AllStudentsMultiSelect
                label={'Wybierz uczniów'}
                variant={'filled'}
                {...form.getInputProps('students')}
              />
            )}
            <Checkbox
              label={'Przypisz do nauczyciela'}
              {...form.getInputProps('addTeacher', { type: 'checkbox' })}
            />
            {form.values.addTeacher && (
              <AllTeachersSelect
                label={'Wybierz nauczyciela'}
                variant={'filled'}
                {...form.getInputProps('teacher')}
              />
            )}
          </>
        )}
      </Stack>
      <Group spacing={'md'} mt={'md'} position={'right'}>
        <Button type={'submit'} loading={loading}>
          Zapisz
        </Button>
      </Group>
    </form>
  )
}
