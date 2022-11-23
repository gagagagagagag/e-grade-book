import { IsMongoId, IsBoolean } from 'class-validator'

import {
  BOOLEAN_INVALID,
  GROUP_ID_INVALID,
  TEACHER_ID_INVALID,
} from '../../utils/validation-errors'

export class AssignGroupDto {
  @IsMongoId({ message: GROUP_ID_INVALID })
  groupId: string

  @IsMongoId({ message: TEACHER_ID_INVALID })
  teacherId: string

  @IsBoolean({ message: BOOLEAN_INVALID })
  add: boolean
}
