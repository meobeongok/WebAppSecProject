import type { Lesson } from './lesson'

interface Deadline {
  id: number
  isFinished: boolean
  finishAt?: string
  fileDeadlineSubmitLesson: string[]
  deadline: {
    id: number
    lesson: Lesson
    name: string
    description: string
    createAt: string
    begin: string
    end: string
    createBy: number
  }
}

export type { Deadline }
