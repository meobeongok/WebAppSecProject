import type { User } from './user'

interface Course {
  id: number
  mskh: string
  name: string
  description: string
  courseMember: User[]
  courseLecturer: User[]
}

export type { Course }
