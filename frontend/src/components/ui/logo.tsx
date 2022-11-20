import { Image } from '@mantine/core'

import logo from '../../assets/img/logo.svg'

export const Logo = () => {
  return <Image width={'180px'} src={logo} alt={'Logo Ambitni'} />
}

export const SmallLogo = () => {
  return <Image width={'30px'} src={logo} alt={'Logo Ambitni'} />
}
