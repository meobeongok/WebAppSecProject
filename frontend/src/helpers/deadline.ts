import type { Deadline, DeadlineSubmit, LocationItem } from '@/types'
import { Folder } from '@/types'
import { sortLocationItems } from './location'

function addSubmitFileDeadline(deadline: DeadlineSubmit | undefined, file: LocationItem, isSortLocationItem = true): DeadlineSubmit | undefined {
  if (!deadline) return undefined

  if (!file.in_folder) {
    deadline.file_deadlineSubmit_lesson.push(file)
  } else {
    const folderIndex = deadline.file_deadlineSubmit_lesson.findIndex((item) => item.type === 'folder' && item.name === file.in_folder)
    if (folderIndex > -1) {
      deadline.file_deadlineSubmit_lesson[folderIndex].children?.push(file)
    } else {
      const newFolder = new Folder(-(deadline.file_deadlineSubmit_lesson.length + 1), file.in_folder, '', [file])
      deadline.file_deadlineSubmit_lesson.push(newFolder)
    }
  }

  if (isSortLocationItem) deadline.file_deadlineSubmit_lesson = sortLocationItems(deadline.file_deadlineSubmit_lesson)

  return Object.create(deadline)
}

function deleteSubmitFileDeadline(deadline: DeadlineSubmit | undefined, fileId: number, isSortLocationItem = true): DeadlineSubmit | undefined {
  if (!deadline || !deadline.file_deadlineSubmit_lesson) return undefined

  let file: LocationItem | undefined = undefined
  const fileIndex = deadline.file_deadlineSubmit_lesson.findIndex((item) => item.type !== 'folder' && item.id === fileId)
  if (fileIndex < 0) {
    for (const folder of deadline.file_deadlineSubmit_lesson.filter((item) => item.type === 'folder')) {
      if (folder.children) {
        const tempIndex = folder.children.findIndex((item) => item.id === fileId)
        if (tempIndex >= 0) {
          file = folder.children[tempIndex]
          break
        }
      }
    }
  } else {
    file = deadline.file_deadlineSubmit_lesson[fileIndex]
  }

  if (file && !file.in_folder) deadline.file_deadlineSubmit_lesson.splice(fileIndex, 1)
  else {
    const folderIndex = deadline.file_deadlineSubmit_lesson.findIndex((item) => item.type === 'folder' && item.name === file?.in_folder)
    const folder = deadline.file_deadlineSubmit_lesson[folderIndex]
    if (folder.children) {
      if (folder.children.length === 1) deadline.file_deadlineSubmit_lesson.splice(folderIndex, 1)
      else deadline.file_deadlineSubmit_lesson[folderIndex].children = folder.children.filter((item) => item.id !== file?.id)
    }
  }

  if (isSortLocationItem) deadline.file_deadlineSubmit_lesson = sortLocationItems(deadline.file_deadlineSubmit_lesson)

  return Object.create(deadline)
}

function addCourseAndLessonNameToDeadline(deadlines: Deadline[], courseName: string, lessonName: string, courseId: number): Deadline[] {
  const newDeadlines: Deadline[] = []
  for (let i = 0; i < deadlines.length; i++) {
    newDeadlines.push({
      ...deadlines[i],
      courseName: courseName,
      lessonName: lessonName,
      courseId
    })
  }

  return newDeadlines
}

export { addSubmitFileDeadline, deleteSubmitFileDeadline, addCourseAndLessonNameToDeadline }
