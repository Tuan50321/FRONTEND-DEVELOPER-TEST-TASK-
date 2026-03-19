// Import type LessonStatus từ types
import type { LessonStatus } from '@/types/lesson'

// Định nghĩa type cho progress map: userId -> courseId -> lessonId -> status
type ProgressMap = Record<string, Record<string, Record<string, LessonStatus>>>

// Key để lưu trữ trong localStorage
const STORAGE_KEY = 'learny.lessonProgress.v2'

// Hàm an toàn để parse JSON từ localStorage
function safeParse(json: string | null): ProgressMap {
  if (!json) return {} // Nếu không có data, trả về object rỗng
  try {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return {} // Kiểm tra type
    return parsed as ProgressMap
  } catch {
    return {} // Nếu lỗi parse, trả về object rỗng
  }
}

// Hàm kiểm tra có thể sử dụng localStorage không
function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// Hàm lấy trạng thái bài học (back-compat, dùng cho guest)
export function getLessonStatus(courseId: number, lessonId: string): LessonStatus {
  if (!canUseStorage()) return 'not-started' // Mặc định chưa bắt đầu
  // Back-compat: nếu gọi không có user scope, treat as guest
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  return data['guest']?.[String(courseId)]?.[lessonId] ?? 'not-started' // Trả về status hoặc mặc định
}

// Hàm set trạng thái bài học (back-compat, dùng cho guest)
export function setLessonStatus(courseId: number, lessonId: string, status: LessonStatus) {
  if (!canUseStorage()) return // Nếu không có storage, bỏ qua
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const userKey = 'guest' // Dùng key 'guest'
  const courseKey = String(courseId)
  const user = data[userKey] ?? {} // Lấy data user hoặc object rỗng
  const course = user[courseKey] ?? {} // Lấy data course hoặc object rỗng
  course[lessonId] = status // Set status cho lesson
  user[courseKey] = course // Cập nhật course trong user
  data[userKey] = user // Cập nhật user trong data
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) // Lưu lại
}

// Hàm lấy tiến độ khóa học (back-compat, dùng cho guest)
export function getCourseProgress(courseId: number, lessonIds: string[]) {
  if (!canUseStorage()) return { completed: 0, total: lessonIds.length, percent: 0 } // Mặc định 0
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const course = data['guest']?.[String(courseId)] ?? {} // Lấy data course của guest
  const completed = lessonIds.filter((id) => course[id] === 'completed').length // Đếm bài hoàn thành
  const total = lessonIds.length // Tổng số bài
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100) // Tính phần trăm
  return { completed, total, percent }
}

// ===== APIs mới, đúng business logic (scoped by user) =====

// Hàm lấy trạng thái bài học theo user
export function getUserLessonStatus(userId: number, courseId: number, lessonId: string): LessonStatus {
  if (!canUseStorage()) return 'not-started' // Mặc định chưa bắt đầu
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  return data[String(userId)]?.[String(courseId)]?.[lessonId] ?? 'not-started' // Trả về status hoặc mặc định
}

// Hàm set trạng thái bài học theo user
export function setUserLessonStatus(userId: number, courseId: number, lessonId: string, status: LessonStatus) {
  if (!canUseStorage()) return // Nếu không có storage, bỏ qua
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const userKey = String(userId) // Key là string của userId
  const courseKey = String(courseId) // Key là string của courseId
  const user = data[userKey] ?? {} // Lấy data user hoặc object rỗng
  const course = user[courseKey] ?? {} // Lấy data course hoặc object rỗng
  course[lessonId] = status // Set status cho lesson
  user[courseKey] = course // Cập nhật course trong user
  data[userKey] = user // Cập nhật user trong data
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) // Lưu lại
}

// Hàm lấy tiến độ khóa học theo user
export function getUserCourseProgress(userId: number, courseId: number, lessonIds: string[]) {
  if (!canUseStorage()) return { completed: 0, total: lessonIds.length, percent: 0 } // Mặc định 0
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY))
  const course = data[String(userId)]?.[String(courseId)] ?? {} // Lấy data course của user
  const completed = lessonIds.filter((id) => course[id] === 'completed').length // Đếm bài hoàn thành
  const total = lessonIds.length // Tổng số bài
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100) // Tính phần trăm
  return { completed, total, percent }
}

