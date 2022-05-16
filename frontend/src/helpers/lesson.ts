import type { Lesson, LocationItem } from '@/types'
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

export { addFileToLessons, deleteLessonFile }
