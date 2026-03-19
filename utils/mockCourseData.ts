// Import types từ types
import type { Course } from '@/types/course'
import type { Lesson, LessonStatus } from '@/types/lesson'
import { getUserLessonStatus } from '@/utils/progressStorage'

// Định nghĩa type cho post từ JSONPlaceholder API
type JsonPlaceholderPost = {
  userId: number // ID user tạo post
  id: number // ID post
  title: string // Tiêu đề post
  body: string // Nội dung post
}

// Định nghĩa type cho comment từ JSONPlaceholder API
type JsonPlaceholderComment = {
  postId: number // ID post chứa comment
  id: number // ID comment
  name: string // Tên người comment
  email: string // Email người comment
  body: string // Nội dung comment
}

// Mảng các loại khóa học bằng tiếng Việt
const COURSE_TYPES_VI = ['Lập trình', 'Thiết kế', 'Kinh doanh', 'Marketing', 'Khoa học dữ liệu'] as const
// Mảng các mức độ khóa học
const LEVELS: Course['level'][] = ['S', 'Pres', 'TC', 'MTC']

// Hàm tạo mức độ ổn định từ ID
function stableLevelFromId(id: number): Course['level'] {
  return LEVELS[id % LEVELS.length] // Lặp lại theo thứ tự
}

// Hàm tạo loại khóa học ổn định từ userId
function stableTypeFromUserId(userId: number): Course['type'] {
  return COURSE_TYPES_VI[(userId - 1) % COURSE_TYPES_VI.length] ?? 'Lập trình' // Lặp lại hoặc mặc định
}

// Hàm tạo số bài học ổn định từ ID
function stableLessonsFromId(id: number) {
  return 8 + (id % 9) // Từ 8 đến 16 bài
}

// Hàm tạo thời lượng bài học ổn định
function stableDurationMinutes(courseId: number, lessonIndex: number) {
  return 6 + ((courseId * 7 + lessonIndex * 13) % 19) // Từ 6 đến 24 phút
}

// Hàm tạo thumbnail video ổn định (chỉ cho một số bài)
function stableVideoThumbnail(courseId: number, lessonIndex: number) {
  if (lessonIndex % 3 !== 0) return undefined // Chỉ tạo cho bài số 3,6,9,...
  return `https://picsum.photos/seed/course-${courseId}-lesson-${lessonIndex}/640/360`
}

// Hàm làm sạch và chuẩn hóa title
function sanitizeTitleForViTitle(input: string) {
  const s = input.trim().replace(/\s+/g, ' ') // Loại bỏ khoảng trắng thừa
  if (!s) return 'Khóa học' // Mặc định nếu rỗng
  return s.charAt(0).toUpperCase() + s.slice(1) // Viết hoa chữ đầu
}

// Hàm map post từ API thành Course object
function mapPostToCourse(p: JsonPlaceholderPost): Course {
  const type = stableTypeFromUserId(p.userId) // Loại khóa học
  const price = 1299000 // Giá cố định
  const discountedPrice = 199000 + (p.id % 7) * 10000 // Giá giảm ngẫu nhiên
  const level = stableLevelFromId(p.id) // Mức độ
  const titleSeed = sanitizeTitleForViTitle(p.title) // Tiêu đề đã làm sạch

  return {
    id: p.id,
    title: `Khóa học ${p.id}: ${titleSeed}`, // Tiêu đề với ID
    type,
    level,
    description: `Mô tả khóa học (${type} - ${level}):\n${p.body}`, // Mô tả với loại và mức
    thumbnail: `https://picsum.photos/seed/course-${p.id}/800/450`, // Thumbnail từ Picsum
    lessons: stableLessonsFromId(p.id), // Số bài học
    instructor: `Giảng viên ${p.userId}`, // Giảng viên giả
    rating: 4.2 + ((p.id % 7) * 0.1), // Rating ngẫu nhiên
    reviews: 1000 + p.id * 73, // Số review ngẫu nhiên
    price,
    discountedPrice,
    enrolledStudents: 5000 + p.id * 91, // Số học viên ngẫu nhiên
  }
}

// Hàm fetch danh sách khóa học từ JSONPlaceholder
export async function fetchCoursesFromJsonPlaceholder() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', { cache: 'no-store' }) // Fetch không cache
  if (!res.ok) throw new Error(`JSONPlaceholder request failed: ${res.status}`) // Throw error nếu fail
  const posts = (await res.json()) as JsonPlaceholderPost[] // Parse JSON
  return posts.map(mapPostToCourse) // Map thành Course array
}

// Hàm fetch khóa học theo ID
export async function fetchCourseById(courseId: number) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${courseId}`, { cache: 'no-store' }) // Fetch post theo ID
  if (!res.ok) throw new Error(`JSONPlaceholder request failed: ${res.status}`) // Throw error nếu fail
  const post = (await res.json()) as JsonPlaceholderPost // Parse JSON
  return mapPostToCourse(post) // Map thành Course
}

// Hàm fetch danh sách bài học cho khóa học
export async function fetchLessonsForCourse(courseId: number, userId?: number): Promise<Lesson[]> {
  const course = await fetchCourseById(courseId) // Lấy thông tin khóa học
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${courseId}/comments`, { cache: 'no-store' }) // Fetch comments
  if (!res.ok) throw new Error(`JSONPlaceholder request failed: ${res.status}`) // Throw error nếu fail
  const comments = (await res.json()) as JsonPlaceholderComment[] // Parse JSON

  const lessons: Lesson[] = []
  for (let i = 1; i <= course.lessons; i++) { // Lặp theo số bài học
    const c = comments[i - 1] // Lấy comment tương ứng (có thể undefined)
    const id = String(i) // ID bài học là string của index
    const status: LessonStatus =
      typeof userId === 'number' ? getUserLessonStatus(userId, courseId, id) : 'not-started' // Lấy status từ storage nếu có userId
    lessons.push({
      id,
      courseId,
      index: i,
      title: `Bài ${i}: ${c?.name ? sanitizeTitleForViTitle(c.name) : 'Nội dung bài học'}`, // Tiêu đề từ comment hoặc mặc định
      durationMinutes: stableDurationMinutes(courseId, i), // Thời lượng ổn định
      status,
      description: c?.body ? `Chi tiết bài học:\n${c.body}` : course.description, // Mô tả từ comment hoặc khóa học
      videoThumbnail: stableVideoThumbnail(courseId, i), // Thumbnail nếu có
    })
  }

  return lessons // Trả về mảng lessons
}

// Export tên cũ để tương thích ngược
export const fetchCoursesFromDummyJson = fetchCoursesFromJsonPlaceholder