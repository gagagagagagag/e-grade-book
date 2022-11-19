import { Routes, Route } from 'react-router-dom'

import {
  AuthLayout,
  Login,
  ForgotPassword,
  SetPassword,
} from '../components/auth'

export const AuthenticatePage = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={'/resetPassword'} element={<SetPassword />} />
        <Route path={'/initiatePassword'} element={<SetPassword />} />
        <Route path={'/forgotPassword'} element={<ForgotPassword />} />
        <Route path={'*'} element={<Login />} />
      </Route>
    </Routes>
  )
}
