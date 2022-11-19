import { IsJWT, IsString, MinLength, MaxLength } from 'class-validator'

export class ResetPasswordDto {
  @IsJWT()
  token: string

  @IsString()
  @MinLength(8)
  @MaxLength(60)
  password: string
}