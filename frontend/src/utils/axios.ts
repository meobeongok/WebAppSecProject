import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? (document.domain + '/api/'),
  withCredentials: true
})

export { axiosInstance }
