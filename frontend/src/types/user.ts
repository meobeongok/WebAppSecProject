interface User {
  id: number
  code: string
  email: string
  name: string
  image: string
  gender: 'male' | 'female' | 'none'
  is_lecturer: boolean
}

export type { User }
