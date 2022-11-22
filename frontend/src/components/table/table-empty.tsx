import { Text } from '@mantine/core'

export const TableEmpty = ({ columnNumber }: { columnNumber: number }) => {
  return (
    <tr>
      <td colSpan={columnNumber}>
        <Text weight={500} align={'center'}>
          Nie znaleziono
        </Text>
      </td>
    </tr>
  )
}
