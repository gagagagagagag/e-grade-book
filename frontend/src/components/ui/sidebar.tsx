import {
  Navbar,
  Center,
  Tooltip,
  UnstyledButton,
  createStyles,
  Stack,
} from '@mantine/core'
import {
  TablerIcon,
  IconHome2,
  IconSchool,
  IconLogout,
  IconKey,
  IconUser,
  IconUsers,
} from '@tabler/icons'
import { useLocation, useNavigate } from 'react-router-dom'

import { useCurrentRole, useLogout } from '../auth/hooks'
import { UserRoles } from '../users/types'
import { SmallLogo } from './'

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  active: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({
        variant: 'light',
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
        .color,
    },
  },
}))

interface NavbarLinkProps {
  icon: TablerIcon
  label: string
  active?: boolean
  onClick?(): void
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  const { classes, cx } = useStyles()
  return (
    <Tooltip label={label} position="right" transitionDuration={0}>
      <UnstyledButton
        onClick={onClick}
        className={cx(classes.link, { [classes.active]: active })}
      >
        <Icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  )
}

const pages = [
  {
    icon: IconHome2,
    label: 'Strona Główna',
    path: '/',
    allowedRoles: [
      UserRoles.Admin,
      UserRoles.Parent,
      UserRoles.Student,
      UserRoles.Teacher,
    ],
  },
  {
    icon: IconSchool,
    label: 'Lekcje',
    path: '/lessons',
    allowedRoles: [
      UserRoles.Admin,
      UserRoles.Parent,
      UserRoles.Student,
      UserRoles.Teacher,
    ],
  },
  {
    icon: IconUser,
    label: 'Uzytkownicy',
    path: '/user-management',
    allowedRoles: [UserRoles.Admin],
  },
  {
    icon: IconUsers,
    label: 'Grupy',
    path: '/group-management',
    allowedRoles: [UserRoles.Admin],
  },
]

export const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useCurrentRole()
  const logout = useLogout()

  const links = pages
    .filter((page) => page.allowedRoles.some((pageRole) => pageRole === role))
    .map((page) => (
      <NavbarLink
        label={page.label}
        icon={page.icon}
        key={page.path}
        active={location.pathname === page.path}
        onClick={() => navigate(page.path)}
      />
    ))

  return (
    <Navbar height={'100%'} width={{ base: 80 }} p="md">
      <Center>
        <SmallLogo />
      </Center>
      <Navbar.Section grow mt={50}>
        <Stack justify="center" spacing={0}>
          {links}
        </Stack>
      </Navbar.Section>
      <Navbar.Section>
        <Stack justify="center" spacing={0}>
          <NavbarLink icon={IconKey} label="Zmień hasło" />
          <NavbarLink
            onClick={logout}
            icon={IconLogout}
            label={'Wyloguj się'}
          />
        </Stack>
      </Navbar.Section>
    </Navbar>
  )
}
