import { Routes, Route } from 'react-router-dom'

import {
  AuthLayout,
  Login,
  ForgotPassword,
  InitiatePassword,
  ResetPassword,
} from '../components/auth'

export const AuthenticatePage = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={'/resetPassword'} element={<ResetPassword />} />
        <Route path={'/initiatePassword'} element={<InitiatePassword />} />
        <Route path={'/forgotPassword'} element={<ForgotPassword />} />
        <Route path={'*'} element={<Login />} />
      </Route>
    </Routes>
  )
}
