import type { Deadline, Lesson, LocationItem } from '@/types'
import { Folder } from '@/types'
import { sortLocationItems } from './location'

function addFileToLessons(lessons: Lesson[], lessonId: number, file: LocationItem, isSortLocationItem = true) {
  const newLessons = lessons
  const lessonIndex = newLessons.findIndex((lesson) => lesson.id === lessonId)

  if (!file.in_folder) {
    newLessons[lessonIndex].locationItems.push(file)
  } else {
    const folderIndex = newLessons[lessonIndex].locationItems.findIndex((item) => item.type === 'folder' && item.name === file.in_folder)
    if (folderIndex > -1) {
      newLessons[lessonIndex].locationItems[folderIndex].children?.push(file)
    } else {
      const newFolder = new Folder(-(newLessons[lessonIndex].locationItems.length + 1), file.in_folder, '', [file])
      newLessons[lessonIndex].locationItems.push(newFolder)
    }
  }

  if (isSortLocationItem) newLessons[lessonIndex].locationItems = sortLocationItems(newLessons[lessonIndex].locationItems)

  return [...newLessons]
}

function deleteLessonFile(lessons: Lesson[], lessonId: number, fileId: number, isSortLocationItem = true) {
  const newLessons = lessons
  const lessonIndex = newLessons.findIndex((lesson) => lesson.id === lessonId)

  let file: LocationItem | undefined = undefined
  const fileIndex = newLessons[lessonIndex].locationItems.findIndex((item) => item.type !== 'folder' && item.id === fileId)
  if (fileIndex < 0) {
    for (const folder of newLessons[lessonIndex].locationItems.filter((item) => item.type === 'folder')) {
      if (folder.children) {
        const tempIndex = folder.children.findIndex((item) => item.id === fileId)
        if (tempIndex >= 0) {
          file = folder.children[tempIndex]
          break
        }
      }
    }
  } else {
    file = newLessons[lessonIndex].locationItems[fileIndex]
  }

  if (file && !file.in_folder) newLessons[lessonIndex].locationItems.splice(fileIndex, 1)
  else {
    const folderIndex = newLessons[lessonIndex].locationItems.findIndex((item) => item.type === 'folder' && item.name === file?.in_folder)
    const folder = newLessons[lessonIndex].locationItems[folderIndex]
    if (folder.children) {
      if (folder.children.length === 1) newLessons[lessonIndex].locationItems.splice(folderIndex, 1)
      else newLessons[lessonIndex].locationItems[folderIndex].children = folder.children.filter((item) => item.id !== file?.id)
    }
  }

  if (isSortLocationItem) newLessons[lessonIndex].locationItems = sortLocationItems(newLessons[lessonIndex].locationItems)

  return [...newLessons]
}

function addDeadlineToLessons(lessons: Lesson[], lessonId: number, deadline: Deadline) {
  const newLessons = lessons
  const lessonIndex = newLessons.findIndex((lesson) => lesson.id === lessonId)
  newLessons[lessonIndex].deadline_lesson.push(deadline)

  return [...newLessons]
}

function editLessonsDeadline(lessons: Lesson[], lessonId: number, deadlineId: number, deadline: Deadline) {
  const newLessons = lessons
  const lessonIndex = newLessons.findIndex((lesson) => lesson.id === lessonId)
  newLessons[lessonIndex].deadline_lesson = newLessons[lessonIndex].deadline_lesson.map((dl) => (dl.id === deadlineId ? deadline : dl))

  return [...newLessons]
}

function deleteLessonsDeadline(lessons: Lesson[], lessonId: number, deadlineId: number) {
  const newLessons = lessons
  const lessonIndex = newLessons.findIndex((lesson) => lesson.id === lessonId)
  newLessons[lessonIndex].deadline_lesson = newLessons[lessonIndex].deadline_lesson.filter((deadline) => deadline.id !== deadlineId)

  return [...newLessons]
}

function addFileToLessonsDeadline(lessons: Lesson[], lessonId: number, deadlineId: number, file: LocationItem, isSortLocationItem = true) {
  const newLessons = lessons
  const lessonIndex = newLessons.findIndex((lesson) => lesson.id === lessonId)
  const deadlineIndex = newLessons[lessonIndex].deadline_lesson.findIndex((deadline) => deadline.id === deadlineId)
  const deadlines = newLessons[lessonIndex].deadline_lesson[deadlineIndex]

  if (!file.in_folder) {
    deadlines.locationItems.push(file)
  } else {
    const folderIndex = deadlines.locationItems.findIndex((item) => item.type === 'folder' && item.name === file.in_folder)
    if (folderIndex > -1) {
      deadlines.locationItems[folderIndex].children?.push(file)
    } else {
      const newFolder = new Folder(-(deadlines.locationItems.length + 1), file.in_folder, '', [file])
      deadlines.locationItems.push(newFolder)
    }
  }

  if (isSortLocationItem) newLessons[lessonIndex].deadline_lesson[deadlineIndex].locationItems = sortLocationItems(deadlines.locationItems)

  return [...newLessons]
}

function deleteLessonsDeadlineFile(lessons: Lesson[], lessonId: number, deadlineId: number, fileId: number, isSortLocationItem = true) {
  const newLessons = lessons
  const lessonIndex = newLessons.findIndex((lesson) => lesson.id === lessonId)
  const deadlineIndex = newLessons[lessonIndex].deadline_lesson.findIndex((deadline) => deadline.id === deadlineId)
  const deadlines = newLessons[lessonIndex].deadline_lesson[deadlineIndex]

  let file: LocationItem | undefined = undefined
  const fileIndex = deadlines.locationItems.findIndex((item) => item.type !== 'folder' && item.id === fileId)
  if (fileIndex < 0) {
    for (const folder of deadlines.locationItems.filter((item) => item.type === 'folder')) {
      if (folder.children) {
        const tempIndex = folder.children.findIndex((item) => item.id === fileId)
        if (tempIndex >= 0) {
          file = folder.children[tempIndex]
          break
        }
      }
    }
  } else {
    file = deadlines.locationItems[fileIndex]
  }

  if (file && !file.in_folder) deadlines.locationItems.splice(fileIndex, 1)
  else {
    const folderIndex = deadlines.locationItems.findIndex((item) => item.type === 'folder' && item.name === file?.in_folder)
    const folder = deadlines.locationItems[folderIndex]
    if (folder.children) {
      if (folder.children.length === 1) deadlines.locationItems.splice(folderIndex, 1)
      else deadlines.locationItems[folderIndex].children = folder.children.filter((item) => item.id !== file?.id)
    }
  }

  if (isSortLocationItem) newLessons[lessonIndex].deadline_lesson[deadlineIndex].locationItems = sortLocationItems(deadlines.locationItems)

  return [...newLessons]
}

function addCourseNameToLesson(lessons: Lesson[], courseName: string): Lesson[] {
  const newLessons: Lesson[] = []
  for (let i = 0; i < lessons.length; i++) {
    newLessons.push({
      ...lessons[i],
      courseName
    })
  }
  return newLessons
}

export {
  addFileToLessons,
  deleteLessonFile,
  addDeadlineToLessons,
  editLessonsDeadline,
  deleteLessonsDeadline,
  addFileToLessonsDeadline,
  deleteLessonsDeadlineFile,
  addCourseNameToLesson
}
