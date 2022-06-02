import type { LocationItem, LocationPayload } from './location'
import type { User } from './user'

interface DeadlinePayload {
  id: number
  lesson: {
    id: number
    name: string
    course: {
      id: number
      mskh: string
      name: string
    }
  }
  name: string
  description: string
  create_at: string
  begin: string
  end: string
  create_by: number
  file_deadline_lesson: LocationPayload[]
}

interface Deadline {
  id: number
  lesson: {
    id: number
    name: string
    course: {
      id: number
      mskh: string
      name: string
    }
  }
  name: string
  description: string
  create_at: string
  begin: string
  end: string
  create_by: number
  locationItems: LocationItem[]
  submit_id?: number
  is_finished?: boolean
  lessonName?: string
  courseName?: string
  courseId?: number
}

interface DeadlineSubmitPayload {
  id: number
  is_finished: boolean
  finish_at?: string
  file_deadlineSubmit_lesson: LocationPayload[]
  deadline: DeadlinePayload
}

interface DeadlineSubmit {
  id: number
  is_finished: boolean
  finish_at?: string
  file_deadlineSubmit_lesson: LocationItem[]
  deadline: Deadline
}

interface DeadlineStudentSubmitPayload {
  id: number
  is_finished: boolean
  finish_at?: string
  file_deadlineSubmit_lesson: LocationPayload[]
  member: User
}

interface DeadlineStudentSubmit {
  id: number
  is_finished: boolean
  finish_at?: string
  file_deadlineSubmit_lesson: LocationItem[]
  member: User
}

interface DeadlineSubmitProfile {
  id: number
  is_finished: boolean
  finish_at?: string
  deadline: {
    id: number
    lesson: {
      id: number
      course: {
        id: number
      }
    }
    name: string
    description: string
    create_at: string
    begin: string
    end: string
    create_by: number
    locationItems: LocationItem[]
    submit_id?: number
    is_finished?: boolean
  }
}

export type {
  DeadlinePayload,
  Deadline,
  DeadlineSubmit,
  DeadlineSubmitPayload,
  DeadlineStudentSubmitPayload,
  DeadlineStudentSubmit,
  DeadlineSubmitProfile
}
