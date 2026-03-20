'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import type { Course } from '@/types/course'
import type { Lesson } from '@/types/lesson'
import { fetchCourseById, fetchLessonsForCourse } from '@/utils/mockCourseData'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { enrollCourse as enrollCourseMongo, fetchCourseProgress, fetchUserEnrolledCourseIds } from '@/utils/userMongoApi'

function statusBadge(status: Lesson['status']) {
  if (status === 'completed') return 'bg-green-50 text-green-700 border-green-200'
  if (status === 'in-progress') return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  return 'bg-gray-50 text-gray-700 border-gray-200'
}

function statusLabel(status: Lesson['status']) {
  if (status === 'completed') return 'Đã hoàn thành'
  if (status === 'in-progress') return 'Đang học'
  return 'Chưa bắt đầu'
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const { courseId: courseIdParam } = use(params)
  const courseId = Number(courseIdParam)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const [c, ls] = await Promise.all([fetchCourseById(courseId), fetchLessonsForCourse(courseId, user?.id)])
        if (cancelled) return
        setCourse(c)
        setLessons(ls)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Không thể tải khóa học')
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [courseId, user?.id])

  useEffect(() => {
    if (Number.isNaN(courseId)) return
    let cancelled = false
    const run = async () => {
      try {
        const ls = await fetchLessonsForCourse(courseId, user?.id)
        if (cancelled) return
        setLessons(ls)
      } catch {
        // keep previous lesson list
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [courseId, user?.id, refreshKey])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!user || Number.isNaN(courseId)) {
        setEnrolled(false)
        setProgress({ completed: 0, total: 0, percent: 0 })
        return
      }

      try {
        // Lấy enrollment/progress từ MongoDB theo `user.id`
        // - enrollment: bảng `enrollments`
        // - progress: bảng `lesson_progress` (tính % dựa trên số bài completed)
        const [ids, pr] = await Promise.all([
          fetchUserEnrolledCourseIds(user.id),
          fetchCourseProgress(user.id, courseId),
        ])
        if (cancelled) return
        setEnrolled(ids.includes(courseId))
        setProgress(pr)
      } catch {
        // Best-effort: UI vẫn hiển thị dù progress/enrollment API lỗi
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user, courseId, refreshKey])

  useEffect(() => {
    // Ensure progress badge + lesson status update when user comes back
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setRefreshKey((k) => k + 1)
    }
    const handleFocus = () => setRefreshKey((k) => k + 1)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  if (Number.isNaN(courseId)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-gray-700">Course ID không hợp lệ.</p>
        <Link href="/courses" className="text-blue-600 hover:underline">Quay lại danh sách khóa học</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
        </div>
      ) : error || !course ? (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Tải dữ liệu thất bại</h1>
          <p className="text-gray-600 mb-6">{error ?? 'Không tìm thấy khóa học'}</p>
          <Link
            href="/courses"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Quay lại danh sách
          </Link>
        </div>
      ) : (
        <>
          {/* Cover Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between gap-4">
                <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:underline">
                  ← Quay lại
                </Link>
                <div className="flex gap-2 items-center">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {course.type}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {course.level}
                  </span>
                  {user && progress.percent === 100 ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      Đã hoàn thành khóa học
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {course.title}
                  </h1>
                  <p className="mt-3 text-gray-600">
                    {course.description}
                  </p>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={enrolled}
                      onClick={() => {
                        if (!user) {
                          router.push('/auth/login')
                          return
                        }
                        if (enrolled) return
                        enrollCourseMongo(user.id, courseId)
                          .then(() => {
                            setEnrolled(true)
                            setRefreshKey((k) => k + 1)
                            router.push('/my-courses')
                          })
                          .catch(() => {
                            // ignore (handled by UI on retry)
                          })
                      }}
                      className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
                    >
                      {enrolled ? 'Đã đăng ký' : 'Đăng ký khóa học'}
                    </button>
                    {user ? (
                      <Link
                        href="/my-courses"
                        className="h-11 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Xem khóa học của tôi
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Tiến độ</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{progress.completed}</span>/{progress.total} ({progress.percent}%)
                      </p>
                    </div>
                    <div className="mt-3 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Danh sách bài học</h2>
                <p className="text-sm text-gray-600 mt-1">{lessons.length} bài học</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                        {lesson.index}
                      </div>
                      <div>
                        <Link
                          href={`/courses/${courseId}/lessons/${lesson.id}`}
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          {lesson.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span>⏱ {lesson.durationMinutes} phút</span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                              statusBadge(lesson.status)
                            }`}
                          >
                            {statusLabel(lesson.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

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

