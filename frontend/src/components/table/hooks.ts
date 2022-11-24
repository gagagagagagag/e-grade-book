import { useCallback, useState } from 'react'
import { uniqBy, differenceBy } from 'lodash'

import { IntegratedTableSelectionHandler } from './types'

interface SelectionObject {
  _id: string
}

type SelectionMapper<T extends SelectionObject> = (item: T) => SelectionObject

export const useTableSelection = <T extends SelectionObject>(
  mapper: SelectionMapper<T> = (item) => ({ _id: item._id })
) => {
  const [selection, setSelection] = useState<T[]>([])

  const selectionHandler: IntegratedTableSelectionHandler<T> = useCallback(
    (items, mode) => {
      setSelection((prev) => {
        const mappedItems = items.map(mapper)
        const newState =
          mode === 'add'
            ? uniqBy<SelectionObject>([...mappedItems, ...prev], '_id')
            : differenceBy(prev, mappedItems, '_id')

        return newState as T[]
      })
    },
    [mapper]
  )

  const clearSelectionHandler = useCallback(() => {
    setSelection([])
  }, [])

  return {
    selection,
    selectionHandler,
    clearSelectionHandler,
  }
}
