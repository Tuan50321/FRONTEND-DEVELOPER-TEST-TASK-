import type { LessonStatus } from '@/types/lesson'

type CourseProgressMap = Record<string, Record<string, LessonStatus>>

const STORAGE_KEY = 'learny.lessonProgress.v1'

function safeParse(json: string | null): CourseProgressMap {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as CourseProgressMap
  } catch {
    return {}
  }
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getLessonStatus(courseId: number, lessonId: string): LessonStatus {
  if (!canUseStorage()) return 'not-started'
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  return data[String(courseId)]?.[lessonId] ?? 'not-started'
}

export function setLessonStatus(courseId: number, lessonId: string, status: LessonStatus) {
  if (!canUseStorage()) return
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const courseKey = String(courseId)
  const course = data[courseKey] ?? {}
  course[lessonId] = status
  data[courseKey] = course
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getCourseProgress(courseId: number, lessonIds: string[]) {
  if (!canUseStorage()) return { completed: 0, total: lessonIds.length, percent: 0 }
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const course = data[String(courseId)] ?? {}
  const completed = lessonIds.filter((id) => course[id] === 'completed').length
  const total = lessonIds.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, percent }
}

