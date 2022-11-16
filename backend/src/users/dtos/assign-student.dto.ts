import { IsMongoId, IsBoolean } from 'class-validator'

export class AssignStudentDto {
  @IsMongoId()
  studentId: string

  @IsMongoId()
  targetId: string

  @IsBoolean()
  add: boolean
}
