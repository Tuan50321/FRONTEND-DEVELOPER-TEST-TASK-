import type { Course } from '@/types/course'
import type { Lesson, LessonStatus } from '@/types/lesson'
import { getUserLessonStatus } from '@/utils/progressStorage'

type JsonPlaceholderPost = {
  userId: number
  id: number
  title: string
  body: string
}

type JsonPlaceholderComment = {
  postId: number
  id: number
  name: string
  email: string
  body: string
}

const COURSE_TYPES_VI = ['Lập trình', 'Thiết kế', 'Kinh doanh', 'Marketing', 'Khoa học dữ liệu'] as const
const LEVELS: Course['level'][] = ['S', 'Pres', 'TC', 'MTC']

function stableLevelFromId(id: number): Course['level'] {
  return LEVELS[id % LEVELS.length]
}

function stableTypeFromUserId(userId: number): Course['type'] {
  return COURSE_TYPES_VI[(userId - 1) % COURSE_TYPES_VI.length] ?? 'Lập trình'
}

function stableLessonsFromId(id: number) {
  return 8 + (id % 9) // 8..16
}

function stableDurationMinutes(courseId: number, lessonIndex: number) {
  return 6 + ((courseId * 7 + lessonIndex * 13) % 19) // 6..24
}

function stableVideoThumbnail(courseId: number, lessonIndex: number) {
  if (lessonIndex % 3 !== 0) return undefined
  return `https://picsum.photos/seed/course-${courseId}-lesson-${lessonIndex}/640/360`
}

function sanitizeTitleForViTitle(input: string) {
  const s = input.trim().replace(/\s+/g, ' ')
  if (!s) return 'Khóa học'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function mapPostToCourse(p: JsonPlaceholderPost): Course {
  const type = stableTypeFromUserId(p.userId)
  const price = 1299000
  const discountedPrice = 199000 + (p.id % 7) * 10000
  const level = stableLevelFromId(p.id)
  const titleSeed = sanitizeTitleForViTitle(p.title)

  return {
    id: p.id,
    title: `Khóa học ${p.id}: ${titleSeed}`,
    type,
    level,
    description: `Mô tả khóa học (${type} - ${level}):\n${p.body}`,
    thumbnail: `https://picsum.photos/seed/course-${p.id}/800/450`,
    lessons: stableLessonsFromId(p.id),
    instructor: `Giảng viên ${p.userId}`,
    rating: 4.2 + ((p.id % 7) * 0.1),
    reviews: 1000 + p.id * 73,
    price,
    discountedPrice,
    enrolledStudents: 5000 + p.id * 91,
  }
}

export async function fetchCoursesFromJsonPlaceholder() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', { cache: 'no-store' })
  if (!res.ok) throw new Error(`JSONPlaceholder request failed: ${res.status}`)
  const posts = (await res.json()) as JsonPlaceholderPost[]
  return posts.map(mapPostToCourse)
}

export async function fetchCourseById(courseId: number) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${courseId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`JSONPlaceholder request failed: ${res.status}`)
  const post = (await res.json()) as JsonPlaceholderPost
  return mapPostToCourse(post)
}

export async function fetchLessonsForCourse(courseId: number, userId?: number): Promise<Lesson[]> {
  const course = await fetchCourseById(courseId)
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${courseId}/comments`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`JSONPlaceholder request failed: ${res.status}`)
  const comments = (await res.json()) as JsonPlaceholderComment[]

  const lessons: Lesson[] = []
  for (let i = 1; i <= course.lessons; i++) {
    const c = comments[i - 1]
    const id = String(i)
    const status: LessonStatus =
      typeof userId === 'number' ? getUserLessonStatus(userId, courseId, id) : 'not-started'
    lessons.push({
      id,
      courseId,
      index: i,
      title: `Bài ${i}: ${c?.name ? sanitizeTitleForViTitle(c.name) : 'Nội dung bài học'}`,
      durationMinutes: stableDurationMinutes(courseId, i),
      status,
      description: c?.body ? `Chi tiết bài học:\n${c.body}` : course.description,
      videoThumbnail: stableVideoThumbnail(courseId, i),
    })
  }

  return lessons
}

// Back-compat export name used in older code
export const fetchCoursesFromDummyJson = fetchCoursesFromJsonPlaceholder