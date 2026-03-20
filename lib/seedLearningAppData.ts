import clientPromise from '@/lib/mongodb'
import type { Course } from '@/types/course'
import type { Lesson } from '@/types/lesson'

/**
 * Seed dữ liệu "khóa học + bài học" vào MongoDB để demo UI như Udemy.
 *
 * Collections:
 * - `learning-app.courses`: danh sách khóa học
 * - `learning-app.lessons`: danh sách bài học theo `courseId`
 *
 * `seed_meta` dùng để biết version seed hiện tại.
 * Khi đổi `SEED_VERSION`, seed sẽ refresh lại `courses/lessons` (KHÔNG xóa enrollment/progress của user).
 */

type JsonPlaceholderPost = {
  userId: number
  id: number
  title: string
  body: string
}

type SeedMetaDoc = {
  key: string
  seededAt: string
  version: number
}

const SEED_KEY = 'learning-app.seed.v1'
const SEED_VERSION = 2

const COURSE_TYPES_VI = ['Lập trình', 'Thiết kế', 'Kinh doanh', 'Marketing', 'Khoa học dữ liệu'] as const
const LEVELS: Course['level'][] = ['S', 'Pres', 'TC', 'MTC']
const LEVEL_LABELS: Record<Course['level'], string> = {
  S: 'Người mới',
  Pres: 'Phù hợp nền tảng sẵn',
  TC: 'Trung cấp',
  MTC: 'Nâng cao',
}

const TOPICS = [
  'React & Next.js',
  'TypeScript',
  'Node.js Backend',
  'Python for Developers',
  'SQL & Database Design',
  'Data Analysis with Python',
  'Machine Learning Basics',
  'Docker & Container Workflow',
  'Kubernetes Fundamentals',
  'UI/UX for Product',
  'System Design Lite',
  'GraphQL in Practice',
] as const

const OUTCOMES = [
  'xây dựng dự án hoàn chỉnh từ A-Z',
  'nắm vững kiến trúc và best practices',
  'viết code sạch, dễ bảo trì',
  'tối ưu hiệu năng và trải nghiệm người dùng',
  'làm chủ luồng dữ liệu & xử lý lỗi thực chiến',
  'triển khai được sản phẩm lên môi trường thật',
] as const

const INSTRUCTORS = [
  'Nguyễn Minh',
  'Trần Quang',
  'Lê Ánh',
  'Phạm Huy',
  'Vũ Hương',
  'Hoàng Long',
  'Đỗ Linh',
  'Bùi Khoa',
] as const

const LESSON_TITLES = [
  'Giới thiệu & mục tiêu',
  'Thiết lập dự án',
  'Hiểu nền tảng cốt lõi',
  'Xây dựng các phần chính',
  'Tích hợp API & dữ liệu',
  'Xử lý lỗi & tối ưu',
  'Bài tập thực hành',
  'Case study dự án',
  'Checklist trước khi deploy',
  'Tổng kết & lộ trình tiếp theo',
] as const

function stableLevelFromId(id: number): Course['level'] {
  return LEVELS[id % LEVELS.length]
}

function stableTypeFromUserId(userId: number): Course['type'] {
  return COURSE_TYPES_VI[(userId - 1) % COURSE_TYPES_VI.length] ?? 'Lập trình'
}

function stableLessonsFromId(id: number) {
  // Udemy thường có số bài khá đa dạng; giữ deterministic theo id
  return 24 + (id % 45) // 24..68
}

function stableDurationMinutes(courseId: number, lessonIndex: number) {
  // Video Udemy thường dao động nhiều; tạo phân phối "có cảm giác thực"
  return 4 + ((courseId * 11 + lessonIndex * 7) % 46) // 4..49
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
  const level = stableLevelFromId(p.id)

  const topic = TOPICS[(p.id - 1) % TOPICS.length]
  const outcome = OUTCOMES[(p.id * 3) % OUTCOMES.length]
  const instructor = INSTRUCTORS[(p.id * 7 + p.userId) % INSTRUCTORS.length]

  const titleSeed = sanitizeTitleForViTitle(p.title)
  const shortTitle = titleSeed.length > 28 ? titleSeed.slice(0, 28).trim() : titleSeed

  const price = 2490000 + (p.id % 8) * 50000
  const discountedPrice = 39000 + (p.id % 9) * 15000

  const rating = 4.2 + ((p.id % 9) * 0.07) // ~4.2..4.8
  const reviews = 800 + p.id * 97 + (p.userId % 5) * 300
  const enrolledStudents = 7000 + p.id * 130 + (p.userId % 7) * 900

  const description = [
    `Bạn sẽ học ${topic} theo hướng thực chiến để áp dụng ngay vào dự án.`,
    `Khóa học tập trung vào: ${outcome}.`,
    ``,
    `Trình độ: ${LEVEL_LABELS[level]}`,
    ``,
    `Điểm nổi bật của khóa học:`,
    `- Bài học rõ ràng, có checklist theo từng giai đoạn`,
    `- Tập trung vào kỹ năng thực hành và tình huống thường gặp`,
    `- Có phần tổng kết + gợi ý lộ trình tiếp theo`,
    ``,
    `Bài ${p.id}: ${shortTitle} (nội dung tham khảo từ nguồn seed).`,
  ].join('\n')

  return {
    id: p.id,
    title: `${topic} - ${shortTitle}`,
    type,
    level,
    description,
    thumbnail: `https://picsum.photos/seed/udemy-course-${p.id}/800/450`,
    lessons: stableLessonsFromId(p.id),
    instructor: `${instructor}`,
    rating: Number(rating.toFixed(2)),
    reviews: Math.round(reviews),
    price,
    discountedPrice,
    enrolledStudents: Math.round(enrolledStudents),
  }
}

function mapCourseToLessons(course: Course): Lesson[] {
  const lessons: Lesson[] = []
  for (let i = 1; i <= course.lessons; i++) {
    const lessonTitle = LESSON_TITLES[(i + course.id) % LESSON_TITLES.length]
    const outcome = OUTCOMES[(course.id * 2 + i) % OUTCOMES.length]

    lessons.push({
      id: String(i),
      courseId: course.id,
      index: i,
      title: `Bài ${i}: ${lessonTitle}`,
      durationMinutes: stableDurationMinutes(course.id, i),
      status: 'not-started',
      description: [
        `Trong bài ${i}, bạn sẽ ${outcome}.`,
        ``,
        `Nội dung tham khảo (seed):`,
        `- Mục tiêu bài học rõ ràng`,
        `- Ví dụ minh họa & thực hành`,
        `- Checklist kết thúc`,
        ``,
        `Trích đoạn mô tả khóa học:`,
        course.description.split('\n')[0] ?? course.description,
      ].join('\n'),
      videoThumbnail: stableVideoThumbnail(course.id, i),
    })
  }
  return lessons
}

export async function seedLearningAppDataIfNeeded() {
  const client = await clientPromise
  const db = client.db('learning-app')

  const seedMetaCol = db.collection<SeedMetaDoc>('seed_meta')
  const coursesCol = db.collection('courses')
  const lessonsCol = db.collection('lessons')

  const existing = await seedMetaCol.findOne({ key: SEED_KEY })
  // Nếu đổi phiên bản seed: refresh dữ liệu course/lesson để khớp format “gần Udemy”.
  // Lưu ý: điều này KHÔNG xóa enrollment/progress của user.
  if (existing && existing.version !== SEED_VERSION) {
    await Promise.all([coursesCol.deleteMany({}), lessonsCol.deleteMany({})])
  }

  if (existing?.version === SEED_VERSION) {
    const [courseCount, lessonCount] = await Promise.all([
      coursesCol.countDocuments(),
      lessonsCol.countDocuments(),
    ])
    if (courseCount > 0 && lessonCount > 0) return
  }

  const [courseCount, lessonCount] = await Promise.all([
    coursesCol.countDocuments(),
    lessonsCol.countDocuments(),
  ])

  if (courseCount === 0) {
    // Fetch source data (chỉ khi chưa có courses)
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=100', { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Failed to fetch seed source: ${res.status}`)
    }
    const posts = (await res.json()) as JsonPlaceholderPost[]
    const courses = posts.map(mapPostToCourse)
    await coursesCol.insertMany(courses, { ordered: false })
  }

  if (lessonCount === 0) {
    // Tạo lessons từ courses hiện có
    const courses = (await coursesCol.find({}).toArray()) as unknown as Course[]
    const allLessons: Lesson[] = []
    for (const c of courses) {
      allLessons.push(...mapCourseToLessons(c))
    }
    await lessonsCol.insertMany(allLessons, { ordered: false })
  }

  await seedMetaCol.updateOne(
    { key: SEED_KEY },
    { $set: { key: SEED_KEY, seededAt: new Date().toISOString(), version: SEED_VERSION } },
    { upsert: true },
  )

  // Best-effort indexes (won't block app)
  try {
    await coursesCol.createIndex({ id: 1 }, { unique: true })
    await lessonsCol.createIndex({ courseId: 1, id: 1 }, { unique: true })
  } catch {
    // ignore
  }
}

