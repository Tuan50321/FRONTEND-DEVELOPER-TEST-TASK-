import type { LessonStatus } from '@/types/lesson'

type ProgressMap = Record<string, Record<string, Record<string, LessonStatus>>>

const STORAGE_KEY = 'learny.lessonProgress.v2'

function safeParse(json: string | null): ProgressMap {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as ProgressMap
  } catch {
    return {}
  }
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getLessonStatus(courseId: number, lessonId: string): LessonStatus {
  if (!canUseStorage()) return 'not-started'
  // Back-compat: if called without user scope, treat as guest
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  return data['guest']?.[String(courseId)]?.[lessonId] ?? 'not-started'
}

export function setLessonStatus(courseId: number, lessonId: string, status: LessonStatus) {
  if (!canUseStorage()) return
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const userKey = 'guest'
  const courseKey = String(courseId)
  const user = data[userKey] ?? {}
  const course = user[courseKey] ?? {}
  course[lessonId] = status
  user[courseKey] = course
  data[userKey] = user
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getCourseProgress(courseId: number, lessonIds: string[]) {
  if (!canUseStorage()) return { completed: 0, total: lessonIds.length, percent: 0 }
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const course = data['guest']?.[String(courseId)] ?? {}
  const completed = lessonIds.filter((id) => course[id] === 'completed').length
  const total = lessonIds.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, percent }
}

// New, correct business-logic APIs (scoped by user)
export function getUserLessonStatus(userId: number, courseId: number, lessonId: string): LessonStatus {
  if (!canUseStorage()) return 'not-started'
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  return data[String(userId)]?.[String(courseId)]?.[lessonId] ?? 'not-started'
}

export function setUserLessonStatus(userId: number, courseId: number, lessonId: string, status: LessonStatus) {
  if (!canUseStorage()) return
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const userKey = String(userId)
  const courseKey = String(courseId)
  const user = data[userKey] ?? {}
  const course = user[courseKey] ?? {}
  course[lessonId] = status
  user[courseKey] = course
  data[userKey] = user
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getUserCourseProgress(userId: number, courseId: number, lessonIds: string[]) {
  if (!canUseStorage()) return { completed: 0, total: lessonIds.length, percent: 0 }
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const course = data[String(userId)]?.[String(courseId)] ?? {}
  const completed = lessonIds.filter((id) => course[id] === 'completed').length
  const total = lessonIds.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, percent }
}

