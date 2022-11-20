import { Image } from '@mantine/core'

import logo from '../../assets/img/logo.svg'
import logoMini from '../../assets/img/logo-mini.png'

export const Logo = () => {
  return <Image width={'180px'} src={logo} alt={'Logo Ambitni'} />
}

export const SmallLogo = () => {
  return <Image width={'30px'} src={logoMini} alt={'Logo Ambitni'} />
}
