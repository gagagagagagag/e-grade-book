import { IsBoolean, IsMongoId } from 'class-validator'

export class AssignStudentDto {
  @IsMongoId()
  studentId: string

  @IsMongoId()
  groupId: string

  @IsBoolean()
  add: boolean
}
