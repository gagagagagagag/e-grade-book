import axios from 'axios'

import { showErrorNotification } from './utils/custom-notifications'

const backendAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

backendAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    showErrorNotification(
      error.response?.data?.message ??
        error.message ??
        'Pojawił się niespodziewany błąd, spróbuj ponownie później'
    )
    return Promise.reject(error)
  }
)

export default backendAxios
