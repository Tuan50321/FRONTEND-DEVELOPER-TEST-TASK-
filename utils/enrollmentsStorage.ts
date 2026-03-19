type EnrollmentMap = Record<string, number[]>

const STORAGE_KEY = 'learny.enrollments.v1'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeParse(json: string | null): EnrollmentMap {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as EnrollmentMap
  } catch {
    return {}
  }
}

export function getEnrolledCourseIds(userId: number): number[] {
  if (!canUseStorage()) return []
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const list = data[String(userId)] ?? []
  return Array.isArray(list) ? list.filter((x) => typeof x === 'number') : []
}

export function isCourseEnrolled(userId: number, courseId: number) {
  return getEnrolledCourseIds(userId).includes(courseId)
}

export function enrollCourse(userId: number, courseId: number) {
  if (!canUseStorage()) return
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const key = String(userId)
  const list = new Set(getEnrolledCourseIds(userId))
  list.add(courseId)
  data[key] = Array.from(list)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function unenrollCourse(userId: number, courseId: number) {
  if (!canUseStorage()) return
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const key = String(userId)
  const list = getEnrolledCourseIds(userId).filter((id) => id !== courseId)
  data[key] = list
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

