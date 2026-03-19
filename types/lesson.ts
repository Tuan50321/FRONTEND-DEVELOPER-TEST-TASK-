// Định nghĩa type cho trạng thái bài học
export type LessonStatus = 'not-started' | 'in-progress' | 'completed'

// Định nghĩa interface cho Lesson (Bài học)
export interface Lesson {
  id: string // ID duy nhất của bài học
  courseId: number // ID của khóa học chứa bài học này
  index: number // Thứ tự bài học trong khóa học
  title: string // Tiêu đề bài học
  durationMinutes: number // Thời lượng bài học (phút)
  status: LessonStatus // Trạng thái học: chưa bắt đầu, đang học, đã hoàn thành
  description: string // Mô tả bài học
  videoThumbnail?: string // URL thumbnail video (tùy chọn)
}

