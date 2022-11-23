import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' })
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException('Podany email lub hasło są niepoprawne')
    }

    if (!user.passwordInitiated || !user.password) {
      throw new BadRequestException(
        'Nie możemy Cię zalogować ponieważ nie stworzyłeś hasła do swojego konta. Przejdź do Zapomniałem hasła aby wysłać maila z linkiem ponownie'
      )
    }

    return user
  }
}
