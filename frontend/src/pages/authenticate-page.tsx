import { Routes, Route } from 'react-router-dom'
import { AuthLayout } from '../components/auth/auth-layout'

export const AuthenticatePage = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={'*'} element={<span>TEST</span>} />
      </Route>
    </Routes>
  )
}
