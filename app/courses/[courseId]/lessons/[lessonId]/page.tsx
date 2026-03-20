'use client'

import Link from 'next/link'
import { use, useEffect, useMemo, useRef, useState } from 'react'
import type { Lesson } from '@/types/lesson'
import { fetchCourseById, fetchLessonsForCourse } from '@/utils/mockCourseData'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { fetchUserEnrolledCourseIds, setUserLessonStatus as setUserLessonStatusMongo } from '@/utils/userMongoApi'

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { user } = useAuth()
  const router = useRouter()
  const { courseId: courseIdParam, lessonId } = use(params)
  const courseId = Number(courseIdParam)

  const [courseTitle, setCourseTitle] = useState<string>('')
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [autoCompleted, setAutoCompleted] = useState(false)
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  
  // Sử dụng ref để tracking thời gian học mà không trigger re-render
  const lessonStartTimeRef = useRef<number | null>(null)
  const timeSpentSoFarRef = useRef<number>(0)

  const TOTAL_LEARNING_TIME_SECONDS = 180 // 3 phút

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const [course, lessonsList] = await Promise.all([fetchCourseById(courseId), fetchLessonsForCourse(courseId, user?.id)])
        if (cancelled) return
        setCourseTitle(course.title)
        setLessons(lessonsList)
        const found = lessonsList.find((l) => l.id === lessonId) ?? null
        setLesson(found)
        // Reset lessonStartTime khi chuyển sang bài học khác
        lessonStartTimeRef.current = null
        timeSpentSoFarRef.current = 0
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Không thể tải bài học')
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }
    run()

    return () => {
      cancelled = true
    }
  }, [courseId, lessonId, user?.id])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!user || Number.isNaN(courseId)) {
        setIsEnrolled(false)
        setEnrollmentLoading(false)
        return
      }

      setEnrollmentLoading(true)
      try {
        const ids = await fetchUserEnrolledCourseIds(user.id)
        if (cancelled) return
        setIsEnrolled(ids.includes(courseId))
      } finally {
        if (cancelled) return
        setEnrollmentLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [user, courseId])

  useEffect(() => {
    if (!lesson) return
    if (!user || enrollmentLoading) {
      Promise.resolve().then(() => setSecondsLeft(null))
      return
    }
    if (!isEnrolled) {
      Promise.resolve().then(() => setSecondsLeft(null))
      return
    }
    if (lesson.status === 'completed') {
      Promise.resolve().then(() => {
        setSecondsLeft(null)
        setAutoCompleted(false)
      })
      return
    }

    setAutoCompleted(false)

    const spentStorageKey = `lesson_time_spent_${courseId}_${lessonId}_${user.id}`
    
    // Khôi phục thời gian đã học từ localStorage
    const savedSpent = localStorage.getItem(spentStorageKey)
    if (savedSpent) {
      timeSpentSoFarRef.current = parseInt(savedSpent, 10)
    } else {
      timeSpentSoFarRef.current = 0
    }

    // Thời gian bắt đầu session hiện tại
    const sessionStart = Date.now()
    lessonStartTimeRef.current = sessionStart

    // Hàm tính thời gian còn lại
    const calculateTimeLeft = () => {
      const now = Date.now()
      const currentSessionSpent = Math.floor((now - sessionStart) / 1000)
      const totalTimeSpent = timeSpentSoFarRef.current + currentSessionSpent
      const remaining = Math.max(0, TOTAL_LEARNING_TIME_SECONDS - totalTimeSpent)
      return remaining
    }

    // Cập nhật lần đầu
    const initialSecondsLeft = calculateTimeLeft()
    setSecondsLeft(initialSecondsLeft)

    // Auto-complete sau thời gian còn lại
    const timeout = window.setTimeout(() => {
      setUserLessonStatusMongo(user.id, courseId, lesson.id, 'completed')
      setLesson((prev) => (prev ? { ...prev, status: 'completed' } : prev))
      setAutoCompleted(true)
      setSecondsLeft(null)
      localStorage.removeItem(spentStorageKey)
      lessonStartTimeRef.current = null
      timeSpentSoFarRef.current = 0
    }, initialSecondsLeft * 1000)

    // Update secondsLeft mỗi giây
    const interval = window.setInterval(() => {
      const remaining = calculateTimeLeft()
      setSecondsLeft(remaining)

      // Nếu đã timeout, clear interval
      if (remaining <= 0) {
        window.clearInterval(interval)
      }
    }, 1000)

    // Cleanup: lưu thời gian đã học khi rời bài
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
      
      // Tính tổng thời gian đã học trong session này
      const now = Date.now()
      const sessionSpent = Math.floor((now - sessionStart) / 1000)
      const newTotalSpent = timeSpentSoFarRef.current + sessionSpent
      
      // Lưu vào localStorage
      localStorage.setItem(spentStorageKey, newTotalSpent.toString())
    }
  }, [lesson, user, courseId, lessonId, enrollmentLoading, isEnrolled])

  const title = useMemo(() => {
    if (!lesson) return ''
    return `Bài ${lesson.index}: ${lesson.title}`
  }, [lesson])

  const currentLessonIndex = useMemo(() => {
    return lessons.findIndex((l) => l.id === lessonId)
  }, [lessons, lessonId])

  const previousLesson = useMemo(() => {
    if (currentLessonIndex <= 0) return null
    return lessons[currentLessonIndex - 1]
  }, [lessons, currentLessonIndex])

  const nextLesson = useMemo(() => {
    if (currentLessonIndex < 0 || currentLessonIndex >= lessons.length - 1) return null
    return lessons[currentLessonIndex + 1]
  }, [lessons, currentLessonIndex])

  // Helper để format thời gian giây thành "mm:ss"
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Main content */}
        <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/courses/${courseId}`} className="text-sm font-semibold text-blue-600 hover:underline">
            ← Quay lại khóa học
          </Link>
          <Link href="/courses" className="text-sm font-semibold text-gray-700 hover:text-blue-600">
            Khóa học
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-gray-600">Đang tải bài học...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Tải dữ liệu thất bại</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Quay lại khóa học
            </Link>
          </div>
        ) : !lesson ? (
          <div className="py-16 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài học</h1>
            <p className="text-gray-600 mb-6">{courseTitle}</p>
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Quay lại khóa học
            </Link>
          </div>
        ) : (() => {
          const isPreview = lesson.index <= 2
          const canAccessFull = !!(user && isEnrolled)

          // Luật truy cập:
          // - 2 bài đầu (index <= 2) được xem thử miễn phí
          // - Các bài còn lại chỉ mở khi user đã đăng ký course (`enrollments` trong Mongo)
          if (user && enrollmentLoading && !isPreview) {
            return (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
                <p className="mt-4 text-gray-600">Đang kiểm tra đăng ký khóa học...</p>
              </div>
            )
          }

          if (!canAccessFull && !isPreview) {
            return (
              <div className="py-16 text-center">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Cần đăng ký khóa học</h1>
                <p className="text-gray-600 mb-6">
                  Bài học này chỉ mở khi bạn đã đăng ký khóa học. Bạn có thể xem thử 2 bài đầu tiên miễn phí.
                </p>
                <Link
                  href={`/courses/${courseId}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Đăng ký khóa học
                </Link>
              </div>
            )
          }

          return (
          <>
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <p className="text-sm text-gray-500">{courseTitle}</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>⏱ {lesson.durationMinutes} phút</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  lesson.status === 'completed'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : lesson.status === 'not-started'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}>
                  {lesson.status}
                </span>
                {secondsLeft !== null && secondsLeft > 0 ? (
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Tự hoàn thành sau {formatTime(secondsLeft)}
                  </span>
                ) : null}
                {autoCompleted ? (
                  <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Đã tự động hoàn thành
                  </span>
                ) : null}
              </div>
            </div>

            {lesson.videoThumbnail ? (
              <div className="bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                <img src={lesson.videoThumbnail} alt={lesson.title} className="h-full w-full object-cover" />
              </div>
            ) : null}

            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Mô tả bài học</h2>
              <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line">{lesson.description}</p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push('/auth/login')
                      return
                    }
                    if (!isEnrolled) {
                      router.push(`/courses/${courseId}`)
                      return
                    }
                    setUserLessonStatusMongo(user.id, courseId, lesson.id, 'completed')
                    setLesson((prev) => (prev ? { ...prev, status: 'completed' } : prev))
                    // Xóa thời gian bài học khỏi localStorage
                    localStorage.removeItem(`lesson_time_spent_${courseId}_${lessonId}_${user.id}`)
                    lessonStartTimeRef.current = null
                    timeSpentSoFarRef.current = 0
                  }}
                  disabled={secondsLeft !== null}
                  className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                  {secondsLeft !== null ? 'Đang học...' : 'Đánh dấu hoàn thành'}
                </button>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                  {previousLesson ? (
                    <Link
                      href={`/courses/${courseId}/lessons/${previousLesson.id}`}
                      className="flex-1 h-11 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      ← Bài trước
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {nextLesson ? (
                    <Link
                      href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                      className="flex-1 h-11 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      Bài tiếp theo →
                    </Link>
                  ) : null}
                </div>

                <Link
                  href={`/courses/${courseId}`}
                  className="h-11 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Quay lại khóa học
                </Link>
              </div>
            </div>
          </div>
          </>
          )
        })()}
        </div>

        {/* Sidebar - Danh sách bài học */}
        <aside className="w-64 bg-white rounded-2xl border border-gray-200 shadow-sm h-fit sticky top-8">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Danh sách bài học</h3>
            <p className="text-xs text-gray-500 mt-1">{lessons.length} bài</p>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {lessons.map((lessonItem) => {
                const isCurrentLesson = lessonItem.id === lessonId
                return (
                  <li key={lessonItem.id}>
                    <Link
                      href={`/courses/${courseId}/lessons/${lessonItem.id}`}
                      className={`block px-4 py-3 text-sm transition-colors ${
                        isCurrentLesson
                          ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isCurrentLesson
                            ? 'bg-blue-600 text-white'
                            : lessonItem.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {lessonItem.status === 'completed' ? '✓' : lessonItem.index}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{lessonItem.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{lessonItem.durationMinutes} phút</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

