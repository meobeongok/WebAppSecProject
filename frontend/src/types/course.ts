import type { User } from './user'

interface Course {
  id: number
  mskh: string
  name: string
  description: string
  course_member: User[]
  course_lecturer: User[]
}

export type { Course }
