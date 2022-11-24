import { Text } from '@mantine/core'

export const TableEmpty = ({ columnNumber }: { columnNumber: number }) => {
  return (
    <tr>
      <td colSpan={columnNumber}>
        <Text weight={500} align={'center'} mt={'lg'} mb={'lg'}>
          Brak danych do wyświetlenia
        </Text>
      </td>
    </tr>
  )
}
