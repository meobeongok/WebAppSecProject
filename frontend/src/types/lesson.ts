import type { Deadline, DeadlinePayload } from './deadline'
import type { LocationItem, LocationPayload } from './location'

interface LessonPayload {
  id: number
  name: string
  description: string
  course: number
  deadline_lesson: DeadlinePayload[]
  file_lesson: LocationPayload[]
}

interface Lesson {
  id: number
  name: string
  description: string
  course: number
  deadline_lesson: Deadline[]
  locationItems: LocationItem[]
  courseName?: string
}

export type { Lesson, LessonPayload }
