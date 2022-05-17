interface Deadline {
  id: number
  lesson: number
  name: string
  description: string
  create_at: string
  begin: string
  end: string
  create_by: number
}

interface DeadlineSubmit {
  id: number
  is_finished: boolean
  finish_at?: string
  file_deadline_submit_lesson: string[]
  deadline: Deadline
}

export type { Deadline, DeadlineSubmit }
