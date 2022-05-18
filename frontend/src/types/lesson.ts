import type { Course } from './course'
import type { Deadline, DeadlinePayload } from './deadline'
import type { LocationItem, LocationPayload } from './location'

interface LessonPayload {
  id: number
  name: string
  description: string
  course: Course
  deadline_lesson: DeadlinePayload[]
  file_lesson: LocationPayload[]
}

interface Lesson {
  id: number
  name: string
  description: string
  course: Course
  deadline_lesson: Deadline[]
  locationItems: LocationItem[]
}

export type { Lesson, LessonPayload }
