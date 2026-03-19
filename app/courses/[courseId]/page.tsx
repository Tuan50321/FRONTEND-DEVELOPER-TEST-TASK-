// Component client-side cho trang chi tiết khóa học
'use client'

// Import Link để navigation
import Link from 'next/link'
// Import hooks React
import { use, useEffect, useMemo, useState } from 'react'
// Import types
import type { Course } from '@/types/course'
import type { Lesson } from '@/types/lesson'
// Import functions từ utils
import { fetchCourseById, fetchLessonsForCourse } from '@/utils/mockCourseData'
import { getUserCourseProgress, setUserLessonStatus } from '@/utils/progressStorage'
import { enrollCourse, isCourseEnrolled } from '@/utils/enrollmentsStorage'
// Import auth context
import { useAuth } from '@/contexts/AuthContext'
// Import router
import { useRouter } from 'next/navigation'

// Hàm trả về class CSS cho badge status của lesson
function statusBadge(status: Lesson['status']) {
  if (status === 'completed') return 'bg-green-50 text-green-700 border-green-200' // Badge xanh cho hoàn thành
  if (status === 'in-progress') return 'bg-yellow-50 text-yellow-700 border-yellow-200' // Badge vàng cho đang học
  return 'bg-gray-50 text-gray-700 border-gray-200' // Badge xám cho chưa bắt đầu
}

// Hàm trả về label text cho status của lesson
function statusLabel(status: Lesson['status']) {
  if (status === 'completed') return 'Đã hoàn thành' // Text cho hoàn thành
  if (status === 'in-progress') return 'Đang học' // Text cho đang học
  return 'Chưa bắt đầu' // Text cho chưa bắt đầu
}

// Component trang chi tiết khóa học
export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  // Lấy user từ auth context
  const { user } = useAuth()
  // Hook router để navigation
  const router = useRouter()
  // Lấy courseId từ params (async trong Next.js 15)
  const { courseId: courseIdParam } = use(params)
  // Chuyển courseId thành number
  const courseId = Number(courseIdParam)

  // State lưu thông tin khóa học
  const [course, setCourse] = useState<Course | null>(null)
  // State lưu danh sách bài học
  const [lessons, setLessons] = useState<Lesson[]>([])
  // State loading
  const [loading, setLoading] = useState(true)
  // State lỗi
  const [error, setError] = useState<string | null>(null)
  // State kiểm tra đã đăng ký khóa học chưa
  const [enrolled, setEnrolled] = useState(false)

  // useEffect để fetch dữ liệu khóa học và bài học khi component mount hoặc courseId/user thay đổi
  useEffect(() => {
    let cancelled = false // Flag để cancel request
    setLoading(true) // Bật loading
    setError(null) // Xóa lỗi cũ

    // Fetch song song course và lessons
    Promise.all([fetchCourseById(courseId), fetchLessonsForCourse(courseId, user?.id)])
      .then(([c, ls]) => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        setCourse(c) // Lưu course
        setLessons(ls) // Lưu lessons
      })
      .catch((e: unknown) => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        // Lưu lỗi (nếu là Error object thì lấy message, ngược lại dùng message mặc định)
        setError(e instanceof Error ? e.message : 'Không thể tải khóa học')
      })
      .finally(() => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        setLoading(false) // Tắt loading
      })

    // Cleanup function
    return () => {
      cancelled = true
    }
  }, [courseId, user?.id])

  // useEffect để kiểm tra trạng thái đăng ký khóa học
  useEffect(() => {
    if (!user || Number.isNaN(courseId)) {
      setEnrolled(false) // Nếu không có user hoặc courseId không hợp lệ thì chưa đăng ký
      return
    }
    // Kiểm tra khóa học đã được đăng ký chưa
    setEnrolled(isCourseEnrolled(user.id, courseId))
  }, [user, courseId])

  // useMemo để tính danh sách lesson IDs
  const lessonIds = useMemo(() => lessons.map((l) => l.id), [lessons])
  // useMemo để tính progress của user trong khóa học
  const progress = useMemo(() => {
    if (!user) return { completed: 0, total: lessonIds.length, percent: 0 } // Nếu không có user thì progress = 0
    return getUserCourseProgress(user.id, courseId, lessonIds) // Tính progress từ storage
  }, [user, courseId, lessonIds])

  // Kiểm tra courseId hợp lệ
  if (Number.isNaN(courseId)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-gray-700">Course ID không hợp lệ.</p> {/* Thông báo lỗi */}
        <Link href="/courses" className="text-blue-600 hover:underline">Quay lại danh sách khóa học</Link> {/* Link quay lại */}
      </div>
    )
  }

  return (
    // Container chính với background xám nhạt
    <div className="min-h-screen bg-gray-50">
      {/* Loading State - hiển thị khi đang tải */}
      {loading ? (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          {/* Spinner loading */}
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-gray-600">Đang tải khóa học...</p> {/* Text loading */}
        </div>
      ) : error || !course ? ( // Error State - hiển thị khi có lỗi hoặc không tìm thấy course
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Tải dữ liệu thất bại</h1> {/* Tiêu đề lỗi */}
          <p className="text-gray-600 mb-6">{error ?? 'Không tìm thấy khóa học'}</p> {/* Thông báo lỗi */}
          <Link
            href="/courses"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" // Styling button
          >
            Quay lại danh sách {/* Text button */}
          </Link>
        </div>
      ) : (
        <>
          {/* Cover Header - phần header với thông tin khóa học */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 py-6">
              {/* Navigation và badges */}
              <div className="flex items-center justify-between gap-4">
                {/* Link quay lại */}
                <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:underline">
                  ← Quay lại
                </Link>
                {/* Badges hiển thị type, level, và trạng thái hoàn thành */}
                <div className="flex gap-2 items-center">
                  {/* Badge loại khóa học */}
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {course.type}
                  </span>
                  {/* Badge độ khó */}
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {course.level}
                  </span>
                  {/* Badge hoàn thành khóa học (chỉ hiển thị nếu user đã hoàn thành 100%) */}
                  {user && progress.percent === 100 ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      Đã hoàn thành khóa học
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Grid layout cho thumbnail và thông tin chi tiết */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Thumbnail */}
                <div className="md:col-span-2">
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  </div>
                </div>
                {/* Thông tin chi tiết */}
                <div className="md:col-span-3">
                  {/* Tiêu đề khóa học */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {course.title}
                  </h1>
                  {/* Mô tả khóa học */}
                  <p className="mt-3 text-gray-600">
                    {course.description}
                  </p>

                  {/* Buttons đăng ký và xem khóa học của tôi */}
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    {/* Button đăng ký khóa học */}
                    <button
                      type="button"
                      disabled={enrolled} // Disable nếu đã đăng ký
                      onClick={() => {
                        if (!user) {
                          router.push('/auth/login') // Chưa đăng nhập -> chuyển đến login
                          return
                        }
                        if (enrolled) return // Đã đăng ký -> không làm gì
                        enrollCourse(user.id, courseId) // Đăng ký khóa học
                        setEnrolled(true) // Cập nhật state
                        router.push('/my-courses') // Chuyển đến trang my-courses
                      }}
                      className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600" // Styling
                    >
                      {enrolled ? 'Đã đăng ký' : 'Đăng ký khóa học'} {/* Text thay đổi theo trạng thái */}
                    </button>
                    {/* Link đến trang khóa học của tôi (chỉ hiển thị nếu đã đăng nhập) */}
                    {user ? (
                      <Link
                        href="/my-courses"
                        className="h-11 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50" // Styling
                      >
                        Xem khóa học của tôi {/* Text link */}
                      </Link>
                    ) : null}
                  </div>

                  {/* Progress bar - hiển thị tiến độ học tập */}
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Tiến độ</p> {/* Label tiến độ */}
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{progress.completed}</span>/{progress.total} ({progress.percent}%) {/* Thông tin chi tiết */}
                      </p>
                    </div>
                    {/* Thanh progress */}
                    <div className="mt-3 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all" // Thanh progress màu xanh
                        style={{ width: `${progress.percent}%` }} // Chiều rộng theo phần trăm
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Section - danh sách bài học */}
          <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header của section lessons */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Danh sách bài học</h2> {/* Tiêu đề */}
                <p className="text-sm text-gray-600 mt-1">{lessons.length} bài học</p> {/* Số lượng bài học */}
              </div>
            </div>

            {/* Danh sách lessons */}
            <div className="mt-5 space-y-3">
              {/* Map qua từng lesson */}
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow" // Styling card
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Phần thông tin lesson */}
                    <div className="flex items-start gap-3">
                      {/* Số thứ tự bài học */}
                      <div className="min-w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                        {lesson.index}
                      </div>
                      {/* Tiêu đề và metadata */}
                      <div>
                        {/* Link đến trang lesson */}
                        <Link
                          href={`/courses/${courseId}/lessons/${lesson.id}`}
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          {lesson.title}
                        </Link>
                        {/* Metadata: thời gian và trạng thái */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span>⏱ {lesson.durationMinutes} phút</span> {/* Thời gian */}
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadge(lesson.status)}`}>
                            {statusLabel(lesson.status)} {/* Trạng thái với badge */}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail video (nếu có) */}
                  {lesson.videoThumbnail ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                      <img src={lesson.videoThumbnail} alt={lesson.title} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

