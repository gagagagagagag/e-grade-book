import { logout, useAppDispatch } from '../../store'

export const useLogout = () => {
  const dispatch = useAppDispatch()

  return () => dispatch(logout())
}
