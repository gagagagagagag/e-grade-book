import { IsString, MinLength, MaxLength } from 'class-validator'

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  oldPassword: string

  @IsString()
  @MinLength(8)
  @MaxLength(60)
  newPassword: string
}
