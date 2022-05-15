import type { User } from './user'

interface Course {
  mskh: string
  name: string
  description: string
  courseMember: User[]
  courseLecturer: User[]
}

export type { Course }
