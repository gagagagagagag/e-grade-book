import { Skeleton } from '@mantine/core'
import { range } from 'lodash'

export const TableLoading = ({ columnNumber }: { columnNumber: number }) => {
  return (
    <>
      {range(1, 10).map((i) => (
        <tr key={i}>
          {range(0, columnNumber).map((j) => (
            <td key={`${i}${j}`}>
              <Skeleton
                width={`${70 + Math.floor(Math.random() * 30)}%`}
                height={20}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
