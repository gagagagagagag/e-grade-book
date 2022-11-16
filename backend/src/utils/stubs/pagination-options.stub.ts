import { plainToInstance } from 'class-transformer'

import { PaginationOptionsDto } from '../../dtos'

export const generateTestPaginationOptions = (
  props: Partial<
    Pick<
      PaginationOptionsDto,
      'page' | 'perPage' | 'q' | 'sortField' | 'sortDirection'
    >
  > = {}
) => {
  return plainToInstance(PaginationOptionsDto, props, {
    exposeDefaultValues: true,
  })
}
