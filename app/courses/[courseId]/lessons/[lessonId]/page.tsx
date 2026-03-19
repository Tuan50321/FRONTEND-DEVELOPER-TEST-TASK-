// Component client-side cho trang chi tiết bài học
'use client'

// Import Link để navigation
import Link from 'next/link'
// Import hooks React
import { use, useEffect, useMemo, useState } from 'react'
// Import type Lesson
import type { Lesson } from '@/types/lesson'
// Import functions từ utils
import { fetchCourseById, fetchLessonsForCourse } from '@/utils/mockCourseData'
import { setUserLessonStatus } from '@/utils/progressStorage'
// Import auth context
import { useAuth } from '@/contexts/AuthContext'
// Import router
import { useRouter } from 'next/navigation'
// Import function kiểm tra đăng ký
import { isCourseEnrolled } from '@/utils/enrollmentsStorage'

// Component trang chi tiết bài học
export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }> // Params từ Next.js 15
}) {
  // Lấy user từ auth context
  const { user } = useAuth()
  // Hook router để navigation
  const router = useRouter()
  // Lấy courseId và lessonId từ params
  const { courseId: courseIdParam, lessonId } = use(params)
  // Chuyển courseId thành number
  const courseId = Number(courseIdParam)

  // State lưu tiêu đề khóa học
  const [courseTitle, setCourseTitle] = useState<string>('')
  // State lưu thông tin bài học
  const [lesson, setLesson] = useState<Lesson | null>(null)
  // State loading
  const [loading, setLoading] = useState(true)
  // State lỗi
  const [error, setError] = useState<string | null>(null)
  // State đếm ngược thời gian auto-complete (giây)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  // State kiểm tra đã auto-complete chưa
  const [autoCompleted, setAutoCompleted] = useState(false)

  // useEffect để fetch dữ liệu khóa học và bài học khi component mount hoặc params thay đổi
  useEffect(() => {
    let cancelled = false // Flag để cancel request
    setLoading(true) // Bật loading
    setError(null) // Xóa lỗi cũ

    // Fetch song song course và lessons
    Promise.all([fetchCourseById(courseId), fetchLessonsForCourse(courseId, user?.id)])
      .then(([course, lessons]) => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        setCourseTitle(course.title) // Lưu tiêu đề khóa học
        // Tìm lesson theo lessonId
        const found = lessons.find((l) => l.id === lessonId) ?? null
        setLesson(found) // Lưu lesson
      })
      .catch((e: unknown) => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        // Lưu lỗi (nếu là Error object thì lấy message, ngược lại dùng message mặc định)
        setError(e instanceof Error ? e.message : 'Không thể tải bài học')
      })
      .finally(() => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        setLoading(false) // Tắt loading
      })

    // Cleanup function
    return () => {
      cancelled = true
    }
  }, [courseId, lessonId, user?.id])

  // useEffect để xử lý auto-complete lesson sau 15 giây
  useEffect(() => {
    if (!lesson) return // Nếu chưa có lesson thì không làm gì
    if (!user) {
      setSecondsLeft(null) // Nếu chưa đăng nhập thì không auto-complete
      return
    }
    if (!isCourseEnrolled(user.id, courseId)) {
      setSecondsLeft(null) // Nếu chưa đăng ký khóa học thì không auto-complete
      return
    }
    if (lesson.status === 'completed') {
      setSecondsLeft(null) // Nếu đã hoàn thành thì không auto-complete
      setAutoCompleted(false)
      return
    }

    // Bắt đầu đếm ngược 15 giây
    setAutoCompleted(false)
    setSecondsLeft(15)

    // Interval để giảm secondsLeft mỗi giây
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev
        return prev <= 1 ? 0 : prev - 1 // Giảm 1 giây, dừng ở 0
      })
    }, 1000)

    // Timeout để auto-complete sau 15 giây
    const timeout = window.setTimeout(() => {
      setUserLessonStatus(user.id, courseId, lesson.id, 'completed') // Cập nhật status trong storage
      setLesson((prev) => (prev ? { ...prev, status: 'completed' } : prev)) // Cập nhật state lesson
      setAutoCompleted(true) // Đánh dấu đã auto-complete
      setSecondsLeft(null) // Dừng đếm ngược
    }, 15000)

    // Cleanup function
    return () => {
      window.clearInterval(interval) // Xóa interval
      window.clearTimeout(timeout) // Xóa timeout
    }
  }, [lesson, user, courseId])

  // useMemo để tạo title cho trang
  const title = useMemo(() => {
    if (!lesson) return '' // Nếu chưa có lesson thì title rỗng
    return `Bài ${lesson.index}: ${lesson.title}` // Format: "Bài {index}: {title}"
  }, [lesson])

  return (
    // Container chính với background xám nhạt
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Navigation header */}
        <div className="flex items-center justify-between gap-4">
          {/* Link quay lại khóa học */}
          <Link href={`/courses/${courseId}`} className="text-sm font-semibold text-blue-600 hover:underline">
            ← Quay lại khóa học
          </Link>
          {/* Link đến trang danh sách khóa học */}
          <Link href="/courses" className="text-sm font-semibold text-gray-700 hover:text-blue-600">
            Khóa học
          </Link>
        </div>

        {/* Loading State - hiển thị khi đang tải */}
        {loading ? (
          <div className="py-16 text-center">
            {/* Spinner loading */}
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-gray-600">Đang tải bài học...</p> {/* Text loading */}
          </div>
        ) : error ? ( // Error State - hiển thị khi có lỗi
          <div className="py-16 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Tải dữ liệu thất bại</h1> {/* Tiêu đề lỗi */}
            <p className="text-gray-600 mb-6">{error}</p> {/* Thông báo lỗi */}
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" // Styling button
            >
              Quay lại khóa học {/* Text button */}
            </Link>
          </div>
        ) : !lesson ? ( // Not Found State - hiển thị khi không tìm thấy lesson
          <div className="py-16 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài học</h1> {/* Tiêu đề */}
            <p className="text-gray-600 mb-6">{courseTitle}</p> {/* Tên khóa học */}
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" // Styling button
            >
              Quay lại khóa học {/* Text button */}
            </Link>
          </div>
        ) : (() => { // IIFE để xử lý logic access control
          // Kiểm tra có phải preview không (2 bài đầu)
          const isPreview = lesson.index <= 2
          // Kiểm tra có quyền truy cập đầy đủ không (đã đăng ký)
          const canAccessFull = !!(user && isCourseEnrolled(user.id, courseId))

          // Nếu không có quyền truy cập và không phải preview
          if (!canAccessFull && !isPreview) {
            return (
              <div className="py-16 text-center">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Cần đăng ký khóa học</h1> {/* Tiêu đề */}
                <p className="text-gray-600 mb-6">
                  Bài học này chỉ mở khi bạn đã đăng ký khóa học. Bạn có thể xem thử 2 bài đầu tiên miễn phí. {/* Thông báo */}
                </p>
                <Link
                  href={`/courses/${courseId}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" // Styling button
                >
                  Đăng ký khóa học {/* Text button */}
                </Link>
              </div>
            )
          }

          // Nếu có quyền truy cập -> hiển thị nội dung bài học
          return (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Header của lesson */}
              <div className="p-6 border-b border-gray-200">
                <p className="text-sm text-gray-500">{courseTitle}</p> {/* Tên khóa học */}
                <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1> {/* Tiêu đề bài học */}
                {/* Metadata của lesson */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>⏱ {lesson.durationMinutes} phút</span> {/* Thời gian */}
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {lesson.status} {/* Trạng thái */}
                  </span>
                  {/* Badge đếm ngược auto-complete */}
                  {secondsLeft !== null ? (
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      Tự hoàn thành sau {secondsLeft}s {/* Text đếm ngược */}
                    </span>
                  ) : null}
                  {/* Badge đã auto-complete */}
                  {autoCompleted ? (
                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Đã tự động hoàn thành {/* Text đã hoàn thành */}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Video thumbnail (nếu có) */}
              {lesson.videoThumbnail ? (
                <div className="bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                  <img src={lesson.videoThumbnail} alt={lesson.title} className="h-full w-full object-cover" />
                </div>
              ) : null}

              {/* Nội dung bài học */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">Mô tả bài học</h2> {/* Tiêu đề section */}
                <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line">{lesson.description}</p> {/* Mô tả */}

                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  {/* Button đánh dấu hoàn thành */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        router.push('/auth/login') // Chưa đăng nhập -> chuyển đến login
                        return
                      }
                      if (!isCourseEnrolled(user.id, courseId)) {
                        router.push(`/courses/${courseId}`) // Chưa đăng ký -> chuyển đến course detail
                        return
                      }
                      setUserLessonStatus(user.id, courseId, lesson.id, 'completed') // Cập nhật status
                      setLesson((prev) => (prev ? { ...prev, status: 'completed' } : prev)) // Cập nhật state
                    }}
                    disabled={secondsLeft !== null} // Disable khi đang đếm ngược
                    className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600" // Styling
                  >
                    {secondsLeft !== null ? 'Đang học...' : 'Đánh dấu hoàn thành'} {/* Text thay đổi theo trạng thái */}
                  </button>

                  {/* Link quay lại khóa học */}
                  <Link
                    href={`/courses/${courseId}`}
                    className="h-11 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50" // Styling
                  >
                    Quay lại khóa học {/* Text link */}
                  </Link>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

