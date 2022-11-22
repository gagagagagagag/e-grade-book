import { Checkbox } from '@mantine/core'

import {
  IntegratedTableSelection,
  IntegratedTableSelectionHandler,
} from './types'

export const TableSelectRow = ({
  item,
  selection,
  onChange,
}: {
  item: any
  selection?: IntegratedTableSelection
  onChange?: IntegratedTableSelectionHandler<any>
}) => {
  if (!selection && !onChange) {
    return null
  }

  const selected = selection?.some((selected) => selected._id === item._id)

  return (
    <td>
      <Checkbox
        checked={selected}
        onChange={() => onChange?.([item], selected ? 'remove' : 'add')}
      />
    </td>
  )
}
