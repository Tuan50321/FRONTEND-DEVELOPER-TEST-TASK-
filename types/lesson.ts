export type LessonStatus = 'not-started' | 'in-progress' | 'completed'

export interface Lesson {
  id: string
  courseId: number
  index: number
  title: string
  durationMinutes: number
  status: LessonStatus
  description: string
  videoThumbnail?: string
}

