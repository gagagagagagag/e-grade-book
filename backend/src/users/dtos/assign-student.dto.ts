import { IsMongoId, IsBoolean } from 'class-validator'

import {
  BOOLEAN_INVALID,
  STUDENT_ID_INVALID,
} from '../../utils/validation-errors'

export class AssignStudentDto {
  @IsMongoId({ message: STUDENT_ID_INVALID })
  studentId: string

  @IsMongoId({ message: 'ID nauczyciela/rodzica niepoprawne' })
  targetId: string

  @IsBoolean({ message: BOOLEAN_INVALID })
  add: boolean
}
