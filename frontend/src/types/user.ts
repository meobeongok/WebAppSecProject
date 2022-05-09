interface User {
  id: number
  code: string
  email: string
  name: string
  image: string
  gender: 'male' | 'female' | 'none'
  isLecturer: boolean
}

export type { User }
