import type { LessonStatus } from '@/types/lesson'

/**
 * Các hàm gọi API Mongo (App Router) để:
 * - lấy danh sách course user đã đăng ký
 * - lấy % tiến độ course user
 * - cập nhật trạng thái bài học (completed) theo user
 *
 * Lưu ý: UI dùng `localStorage` cho session user (AuthContext),
 * còn enrollment/progress/bài hoàn thành thì lưu trong Mongo.
 */

type CourseProgress = { completed: number; total: number; percent: number }

export async function fetchUserEnrolledCourseIds(userId: number): Promise<number[]> {
  const res = await fetch(`/api/users/${userId}/enrollments`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load enrollments: ${res.status}`)
  const data = (await res.json()) as { courseIds: number[] }
  return Array.isArray(data.courseIds) ? data.courseIds : []
}

export async function enrollCourse(userId: number, courseId: number) {
  const res = await fetch(`/api/users/${userId}/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId }),
  })
  if (!res.ok) throw new Error(`Failed to enroll: ${res.status}`)
}

export async function fetchCourseProgress(
  userId: number,
  courseId: number,
): Promise<CourseProgress> {
  const res = await fetch(`/api/users/${userId}/courses/${courseId}/progress`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load progress: ${res.status}`)
  const data = (await res.json()) as CourseProgress
  return data
}

export async function setUserLessonStatus(
  userId: number,
  courseId: number,
  lessonId: string,
  status: LessonStatus,
) {
  const res = await fetch(`/api/users/${userId}/courses/${courseId}/lessons/${lessonId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`Failed to update lesson status: ${res.status}`)
}

// Convenience helper (async)
export async function isCourseEnrolled(userId: number, courseId: number) {
  const ids = await fetchUserEnrolledCourseIds(userId)
  return ids.includes(courseId)
}

