import { Select, SelectProps } from '@mantine/core'

export type SelectPropsWithoutData = Omit<SelectProps, 'data'>

export const SelectAll = (props: SelectProps) => {
  return (
    <Select
      searchable
      {...props}
      disabled={props.data.length === 0 || props.disabled}
      placeholder={
        props.data.length === 0 ? 'Nie znaleziono' : props.placeholder
      }
    />
  )
}
