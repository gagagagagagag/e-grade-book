import { IsEmail, IsMongoId, IsOptional } from 'class-validator'

export class SendPasswordLinkDto {
  @IsOptional()
  @IsMongoId()
  userId?: string

  @IsOptional()
  @IsEmail()
  email?: string
}
