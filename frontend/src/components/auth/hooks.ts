import { logout, useAppDispatch, useAppSelector } from '../../store'

export const useCurrentUser = () => {
  const user = useAppSelector((state) => state.user.user)

  return user!
}

export const useCurrentRole = () => {
  const user = useCurrentUser()

  return user.role
}

export const useLogout = () => {
  const dispatch = useAppDispatch()

  return () => dispatch(logout())
}
