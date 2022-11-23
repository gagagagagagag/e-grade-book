import { IsPassword } from '../../decorators'
export class ChangePasswordDto {
  @IsPassword()
  oldPassword: string

  @IsPassword()
  newPassword: string
}
