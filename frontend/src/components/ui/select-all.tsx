import {
  MultiSelect,
  MultiSelectProps,
  Select,
  SelectProps,
} from '@mantine/core'

export type MultiSelectPropsWithoutData = Omit<MultiSelectProps, 'data'>

export type SelectPropsWithoutData = Omit<SelectProps, 'data'>

export const MultiSelectAll = (props: MultiSelectProps) => {
  return (
    <MultiSelect
      searchable
      {...props}
      disabled={props.data.length === 0 || props.disabled}
      placeholder={
        props.data.length === 0 ? 'Nie znaleziono' : props.placeholder
      }
    />
  )
}

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
