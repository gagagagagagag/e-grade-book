import { IsString, IsMongoId } from 'class-validator'

export class CreateGroupDto {
  @IsString()
  name: string

  @IsMongoId()
  teacher: string
}
