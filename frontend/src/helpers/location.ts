import lodash from 'lodash'
import type { LocationItem, LocationPayload } from '@/types'
import { File, Folder } from '@/types'

function sortLocationItems(locationItems: LocationItem[]): LocationItem[] {
  const folderArray = locationItems.filter((item) => item.type === 'folder')
  const fileArray = locationItems.filter((item) => item.type !== 'folder')

  function compare(a: LocationItem, b: LocationItem) {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }

  folderArray.sort(compare)
  fileArray.sort(compare)
  return folderArray.concat(fileArray)
}

function fromLocationPayloads(locationResponses: LocationPayload[]): LocationItem[] {
  const locations: LocationItem[] = []
  const fileExtensionPattern = /\.[0-9a-z]+$/i

  const groupedFolder = lodash.groupBy(locationResponses, (i) => i.inFolder)

  let folderId = -1
  for (const folderName in groupedFolder) {
    if (folderName === '') {
      groupedFolder[folderName].forEach((file) => {
        const match = file.fileUpload.match(fileExtensionPattern)
        locations.push(new File(file.id, file.name, match ? match[0] : 'binary', import.meta.env.VITE_MEDIA_URL + file.fileUpload, file.inFolder))
      })
    } else {
      const folder = new Folder(folderId, folderName, '', [])
      folderId -= 1

      groupedFolder[folderName].forEach((file) => {
        const match = file.fileUpload.match(fileExtensionPattern)
        folder.children?.push(
          new File(file.id, file.name, match ? match[0] : 'binary', import.meta.env.VITE_MEDIA_URL + file.fileUpload, file.inFolder)
        )
      })
      locations.push(folder)
    }
  }
  return sortLocationItems(locations)
}

export { fromLocationPayloads }
