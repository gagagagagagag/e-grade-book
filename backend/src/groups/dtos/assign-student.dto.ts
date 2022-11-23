import { IsBoolean, IsMongoId } from 'class-validator'

import {
  BOOLEAN_INVALID,
  GROUP_ID_INVALID,
  STUDENT_ID_INVALID,
} from '../../utils/validation-errors'

export class AssignStudentDto {
  @IsMongoId({ message: STUDENT_ID_INVALID })
  studentId: string

  @IsMongoId({ message: GROUP_ID_INVALID })
  groupId: string

  @IsBoolean({ message: BOOLEAN_INVALID })
  add: boolean
}
