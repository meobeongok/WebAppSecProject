import { api } from '@/constants'
import { addCourseAndLessonNameToDeadline, addCourseNameToLesson } from '@/helpers'
import { useAxiosInstance } from '@/hooks'
import { useUserStore } from '@/stores'
import type { Course, Deadline, DeadlineSubmitPayload, Lesson } from '@/types'
import { Anchor, Card, createStyles, Loader, TextInput, Text } from '@mantine/core'
import * as React from 'react'
import { Link } from 'react-router-dom'

function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
  str = str.replace(/Đ/g, 'D')
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
  str = str.replace(/\u02C6|\u0306|\u031B/g, '')
  str = str.replace(/ + /g, ' ')
  str = str.trim()
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'|"|&|#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ')
  return str
}

const useStyles = createStyles((theme) => ({
  container: {
    position: 'relative'
  },
  searchFlyout: {
    position: 'absolute',
    top: '50px',
    zIndex: 200,
    minWidth: '20rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25',
    alignItems: 'stretch'
  },

  header: {
    fontWeight: 600
  },

  item: {
    padding: '0.25rem 0.5rem',
    width: '100%',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'light' ? '#00000012' : '#ffffff12',
      textDecoration: 'none'
    }
  },

  description: {
    display: 'inline-block',
    color: theme.colorScheme === 'light' ? '#212121' : '#f1f1f1'
  },

  anchor: {
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}))

function SearchBox(): JSX.Element {
  const [isCourseLoading, setCourseLoading] = React.useState<boolean>(true)
  const [isLessonsLoading, setLessonsLoading] = React.useState<boolean>(false)
  const [isGetCoursesFailed, setGetCoursesFailed] = React.useState<boolean>(false)
  const [currentLessonGetIndex, setCurrentLessonGetIndex] = React.useState<number>(0)
  const [isCoursesSpinnerLoading, setCoursesSpinnerLoading] = React.useState<boolean>(true)
  const [isLessonsSpinnerLoading, setLessonsSpinnerLoading] = React.useState<boolean>(true)
  const [isDeadlinesSpinnerLoading, setDeadlinesSpinnerLoading] = React.useState<boolean>(true)
  const [courses, setCourses] = React.useState<Course[]>([])
  const [lessons, setLessons] = React.useState<Lesson[]>([])
  const [deadlines, setDeadlines] = React.useState<Deadline[]>([])

  const [isOpen, setOpen] = React.useState<boolean>(false)
  const [value, setValue] = React.useState<string>('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [filteredCourses, setFilteredCourses] = React.useState<Course[]>([])
  const [filteredLessons, setFilteredLessons] = React.useState<Lesson[]>([])
  const [filteredDeadlines, setFilteredDeadlines] = React.useState<Deadline[]>([])

  const user = useUserStore((state) => state.user)

  const { classes } = useStyles()

  const axiosInstance = useAxiosInstance()

  function search(value: string) {
    const unUnicodeValue = removeVietnameseTones(value.toLowerCase())

    if (courses) {
      let filtered = courses.filter((course) => removeVietnameseTones(course.name.toLowerCase()).includes(unUnicodeValue))
      if (filtered.length > 4) filtered = filtered.slice(0, 3)
      setFilteredCourses(filtered)
    }
    if (lessons) {
      let filtered = lessons.filter((lesson) => removeVietnameseTones(lesson.name.toLowerCase()).includes(unUnicodeValue))
      if (filtered.length > 4) filtered = filtered.slice(0, 3)
      setFilteredLessons(filtered)
    }
    if (deadlines) {
      let filtered = deadlines.filter((deadline) => removeVietnameseTones(deadline.name.toLowerCase()).includes(unUnicodeValue))
      if (filtered.length > 4) filtered = filtered.slice(0, 3)
      setFilteredDeadlines(filtered)
    }
  }

  async function handleGetCourses() {
    setCourseLoading(true)
    setCoursesSpinnerLoading(true)

    let coursesData: Course[] = []

    try {
      coursesData = await axiosInstance.get<Course[]>(api.courses).then(({ data }) => data)
      setCourses(coursesData)
    } catch {
      setGetCoursesFailed(true)
      setCourseLoading(false)
      setCoursesSpinnerLoading(false)
    }

    setGetCoursesFailed(false)
    setCourseLoading(false)
    setCoursesSpinnerLoading(false)

    return coursesData
  }

  async function handleGetLessonsAndDeadlines() {
    if (isCourseLoading) return
    if (user === undefined) return

    let tempCourses = courses
    if (isGetCoursesFailed) {
      const coursesData = await handleGetCourses()
      if (!courses) return
      tempCourses = coursesData
    }

    if (tempCourses.length === 0 || isLessonsLoading) return

    setLessonsLoading(true)
    setLessonsSpinnerLoading(true)
    setDeadlinesSpinnerLoading(true)

    for (let i = currentLessonGetIndex; i < tempCourses.length; i++) {
      try {
        let lessonsData = await axiosInstance.get<Lesson[]>(`${api.courses}${tempCourses[i].id}/lessons/`).then(({ data }) => data)

        if (user && !user.is_lecturer) {
          const arr: Promise<DeadlineSubmitPayload[]>[] = []
          for (const lesson of lessonsData) {
            const promise = axiosInstance.get<DeadlineSubmitPayload[]>(`/deadlineAPI/${lesson.id}/studentDeadlines/`).then(({ data }) => data)
            arr.push(promise)
          }
          const deadlineSubmits = await Promise.all(arr)

          lessonsData = lessonsData.map((ls, index) => {
            const newDeadlines: Deadline[] = ls.deadline_lesson.map((dl) => {
              const submit = deadlineSubmits[index].find((submit) => submit.deadline.id === dl.id)

              return {
                ...dl,
                submit_id: submit?.id,
                courseId: submit?.deadline.lesson.course.id
              }
            })

            return {
              ...ls,
              deadline_lesson: newDeadlines
            }
          })
        }

        lessonsData = addCourseNameToLesson(lessonsData, tempCourses[i].name)
        let tempDeadlines: Deadline[] = []
        for (let j = 0; j < lessonsData.length; j++) {
          tempDeadlines = tempDeadlines.concat(
            addCourseAndLessonNameToDeadline(lessonsData[j].deadline_lesson, tempCourses[i].name, lessonsData[j].name, tempCourses[i].id)
          )
        }

        setLessons((previousValue) => previousValue.concat(lessonsData))
        setDeadlines((previousValue) => previousValue.concat(tempDeadlines))
      } catch {
        setCurrentLessonGetIndex(i)
        break
      }
    }

    setCurrentLessonGetIndex(tempCourses.length)
    setLessonsLoading(false)
    setLessonsSpinnerLoading(false)
    setDeadlinesSpinnerLoading(false)
  }

  function handleClose() {
    setCourses([])
    setLessons([])
    setDeadlines([])
    setCurrentLessonGetIndex(0)
    setGetCoursesFailed(true)
    setCoursesSpinnerLoading(true)
    setLessonsSpinnerLoading(true)
    setDeadlinesSpinnerLoading(true)
  }

  async function handleFocus() {
    handleGetCourses()
    setOpen(true)
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleGetLessonsAndDeadlines()
    setValue(e.target.value)
    search(e.target.value)
  }

  function handleBlur() {
    setOpen(false)
    handleClose()
  }

  function handleClickLinkClose() {
    inputRef.current?.blur()
  }

  React.useEffect(() => {
    search(value)
    if (!isCourseLoading) handleGetLessonsAndDeadlines()
  }, [courses, lessons, deadlines, isCourseLoading])

  return (
    <div>
      <TextInput value={value} ref={inputRef} onFocus={handleFocus} onBlur={handleBlur} onChange={handleChange} />
      {isOpen && (
        <Card shadow="md" radius="md" className={classes.searchFlyout}>
          {filteredCourses.length > 0 && (
            <div className={classes.group}>
              <Text className={classes.header}>Courses</Text>
              {filteredCourses.map(({ id, name }) => (
                <Anchor
                  className={classes.item}
                  component={Link}
                  key={id}
                  to={`courses/${id}`}
                  onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                  onClick={handleClickLinkClose}
                >
                  <Text className={classes.anchor}>{name}</Text>
                </Anchor>
              ))}
              {isCoursesSpinnerLoading && <Loader />}
            </div>
          )}

          <div className={classes.group}>
            {filteredLessons.length > 0 && (
              <>
                <Text className={classes.header}>Lessons</Text>
                {filteredLessons.map(({ id, name, course, courseName }) => (
                  <Anchor
                    className={classes.item}
                    component={Link}
                    key={id}
                    to={`courses/${course}`}
                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    onClick={handleClickLinkClose}
                  >
                    <Text className={classes.anchor}>{name}</Text>
                    <Text className={classes.description}>In {courseName}</Text>
                  </Anchor>
                ))}
                {isLessonsSpinnerLoading && <Loader />}
              </>
            )}
          </div>
          <div className={classes.group}>
            {filteredDeadlines.length > 0 && (
              <>
                <Text className={classes.header}>Deadlines</Text>
                {filteredDeadlines.map(({ id, name, courseName, lessonName, lesson, courseId, submit_id }) => (
                  <Anchor
                    className={classes.item}
                    component={Link}
                    key={id}
                    to={`courses/${courseId}/lessons/${lesson}/${user?.is_lecturer ? `deadlines/${id}` : `submitdeadline/${submit_id}`}`}
                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    onClick={handleClickLinkClose}
                  >
                    <Text className={classes.anchor}>{name}</Text>
                    <Text className={classes.description}>
                      In {courseName} → {lessonName}
                    </Text>
                  </Anchor>
                ))}
                {isDeadlinesSpinnerLoading && <Loader />}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default SearchBox
