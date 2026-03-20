import type { Course } from '@/types/course'
import type { Lesson, LessonStatus } from '@/types/lesson'

export async function fetchCoursesFromJsonPlaceholder() {
  // Lớp "mock" giữ nguyên tên hàm cũ trong UI,
  // nhưng thực tế gọi API Mongo: `GET /api/courses`
  const res = await fetch('/api/courses', { cache: 'no-store' })
  if (!res.ok) throw new Error(`Courses API request failed: ${res.status}`)
  const data = (await res.json()) as { items: Course[] }
  return data.items
}

export async function fetchCourseById(courseId: number) {
  const res = await fetch(`/api/courses/${courseId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Course API request failed: ${res.status}`)
  const data = (await res.json()) as { item: Course }
  return data.item
}

export async function fetchLessonsForCourse(courseId: number, userId?: number): Promise<Lesson[]> {
  // API `/api/courses/[courseId]/lessons` có thể nhận thêm `?userId=...`
  // để server trả về `lesson.status` đúng theo bảng `lesson_progress` của user.
  const qs = typeof userId === 'number' ? `?userId=${encodeURIComponent(String(userId))}` : ''
  const res = await fetch(`/api/courses/${courseId}/lessons${qs}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Lessons API request failed: ${res.status}`)
  const data = (await res.json()) as {
    items: Array<{
      id: string | number
      courseId: number | string
      index: number | string
      title: string
      durationMinutes: number | string
      status?: LessonStatus
      description?: string
      videoThumbnail?: string
    }>
  }

  return data.items.map((l) => {
    return {
      id: String(l.id),
      courseId: Number(l.courseId ?? courseId),
      index: Number(l.index),
      title: String(l.title),
      durationMinutes: Number(l.durationMinutes),
      status: (l.status ?? 'not-started') as LessonStatus,
      description: String(l.description ?? ''),
      videoThumbnail: l.videoThumbnail ?? undefined,
    } satisfies Lesson
  })
}

// Back-compat export name used in older code
export const fetchCoursesFromDummyJson = fetchCoursesFromJsonPlaceholder