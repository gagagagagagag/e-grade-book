import { IsName } from '../../decorators'

export class CreateGroupDto {
  @IsName()
  name: string
}
