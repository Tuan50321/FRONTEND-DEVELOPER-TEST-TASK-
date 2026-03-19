'use client'

import Link from 'next/link'
import { use, useEffect, useMemo, useState } from 'react'
import type { Lesson } from '@/types/lesson'
import { fetchCourseById, fetchLessonsForCourse } from '@/utils/mockCourseData'
import { setUserLessonStatus } from '@/utils/progressStorage'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { isCourseEnrolled } from '@/utils/enrollmentsStorage'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [autoCompleted, setAutoCompleted] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchCourseById(courseId), fetchLessonsForCourse(courseId, user?.id)])
      .then(([course, lessons]) => {
        if (cancelled) return
        setCourseTitle(course.title)
        const found = lessons.find((l) => l.id === lessonId) ?? null
        setLesson(found)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Không thể tải bài học')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [courseId, lessonId, user?.id])

  useEffect(() => {
    if (!lesson) return
    if (!user) {
      setSecondsLeft(null)
      return
    }
    if (!isCourseEnrolled(user.id, courseId)) {
      setSecondsLeft(null)
      return
    }
    if (lesson.status === 'completed') {
      setSecondsLeft(null)
      setAutoCompleted(false)
      return
    }

    setAutoCompleted(false)
    setSecondsLeft(15)

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev
        return prev <= 1 ? 0 : prev - 1
      })
    }, 1000)

    const timeout = window.setTimeout(() => {
      setUserLessonStatus(user.id, courseId, lesson.id, 'completed')
      setLesson((prev) => (prev ? { ...prev, status: 'completed' } : prev))
      setAutoCompleted(true)
      setSecondsLeft(null)
    }, 15000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [lesson, user, courseId])

  const title = useMemo(() => {
    if (!lesson) return ''
    return `Bài ${lesson.index}: ${lesson.title}`
  }, [lesson])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
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
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <p className="text-sm text-gray-500">{courseTitle}</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>⏱ {lesson.durationMinutes} phút</span>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {lesson.status}
                </span>
                {secondsLeft !== null ? (
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Tự hoàn thành sau {secondsLeft}s
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

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push('/auth/login')
                      return
                    }
                    if (!isCourseEnrolled(user.id, courseId)) {
                      router.push(`/courses/${courseId}`)
                      return
                    }
                    setUserLessonStatus(user.id, courseId, lesson.id, 'completed')
                    setLesson((prev) => (prev ? { ...prev, status: 'completed' } : prev))
                  }}
                  disabled={secondsLeft !== null}
                  className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                  {secondsLeft !== null ? 'Đang học...' : 'Đánh dấu hoàn thành'}
                </button>

                <Link
                  href={`/courses/${courseId}`}
                  className="h-11 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Quay lại khóa học
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

