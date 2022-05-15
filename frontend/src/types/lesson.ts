import type { Course } from './course'

interface Lesson {
  id: number
  name: string
  course: Course
}

export type { Lesson }
