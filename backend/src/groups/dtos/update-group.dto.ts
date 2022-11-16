import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator'

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsMongoId()
  teacher?: string

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  students?: string[]
}
