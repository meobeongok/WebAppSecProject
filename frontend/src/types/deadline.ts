import type { Lesson } from './lesson'

interface Deadline {
  id: number
  is_finished: boolean
  finish_at?: string
  file_deadline_submit_lesson: string[]
  deadline: {
    id: number
    lesson: Lesson
    name: string
    description: string
    create_at: string
    begin: string
    end: string
    create_by: number
  }
}

export type { Deadline }
