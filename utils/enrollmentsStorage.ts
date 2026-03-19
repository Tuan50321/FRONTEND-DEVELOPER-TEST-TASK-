// Định nghĩa type cho map enrollments: userId -> array of courseIds
type EnrollmentMap = Record<string, number[]>

// Key để lưu trữ trong localStorage
const STORAGE_KEY = 'learny.enrollments.v1'

// Hàm kiểm tra có thể sử dụng localStorage không (client-side)
function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// Hàm an toàn để parse JSON từ localStorage
function safeParse(json: string | null): EnrollmentMap {
  if (!json) return {} // Nếu không có data, trả về object rỗng
  try {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return {} // Kiểm tra type
    return parsed as EnrollmentMap
  } catch {
    return {} // Nếu lỗi parse, trả về object rỗng
  }
}

// Hàm lấy danh sách ID khóa học đã đăng ký của user
export function getEnrolledCourseIds(userId: number): number[] {
  if (!canUseStorage()) return [] // Nếu không có localStorage, trả về mảng rỗng
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY)) // Lấy data từ storage
  const list = data[String(userId)] ?? [] // Lấy list của user hoặc mảng rỗng
  return Array.isArray(list) ? list.filter((x) => typeof x === 'number') : [] // Lọc chỉ số
}

// Hàm kiểm tra khóa học đã được đăng ký chưa
export function isCourseEnrolled(userId: number, courseId: number) {
  return getEnrolledCourseIds(userId).includes(courseId) // Kiểm tra có trong list không
}

// Hàm đăng ký khóa học
export function enrollCourse(userId: number, courseId: number) {
  if (!canUseStorage()) return // Nếu không có storage, bỏ qua
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY)) // Lấy data hiện tại
  const key = String(userId) // Key là string của userId
  const list = new Set(getEnrolledCourseIds(userId)) // Tạo Set để tránh trùng lặp
  list.add(courseId) // Thêm courseId
  data[key] = Array.from(list) // Chuyển Set thành array
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) // Lưu lại
}

// Hàm hủy đăng ký khóa học
export function unenrollCourse(userId: number, courseId: number) {
  if (!canUseStorage()) return // Nếu không có storage, bỏ qua
  const data = safeParse(window.localStorage.getItem(STORAGE_KEY)) // Lấy data hiện tại
  const key = String(userId) // Key là string của userId
  const list = getEnrolledCourseIds(userId).filter((id) => id !== courseId) // Lọc bỏ courseId
  data[key] = list // Cập nhật list
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) // Lưu lại
}

