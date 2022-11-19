import axios from 'axios'

console.log('ENV', import.meta.env.VITE_BACKEND_URL)

const backendAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

export default backendAxios
