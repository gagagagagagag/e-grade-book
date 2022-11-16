import { IsMongoId, IsBoolean } from 'class-validator'

export class AssignGroupDto {
  @IsMongoId()
  groupId: string

  @IsMongoId()
  teacherId: string

  @IsBoolean()
  add: boolean
}
