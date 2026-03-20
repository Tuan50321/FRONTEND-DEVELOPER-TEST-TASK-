import { Course } from '@/types/course';
import Link from 'next/link';

interface CourseCardProps {
  course: Course;
  completed?: boolean;
  progressPercent?: number;
}

export default function CourseCard({ course, completed, progressPercent }: CourseCardProps) {
  const truncateText = (text: string, lines: number = 2) => {
    const lineArray = text.split('\n');
    return lineArray.slice(0, lines).join('\n');
  };

  return (
    <Link
      href={`/courses/${course.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Thumbnail */}
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {completed ? (
          <div className="absolute left-2 top-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
            Đã hoàn thành
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Course Type and Level */}
        <div className="flex gap-2 mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
            {course.type}
          </span>
          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">
            {course.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {typeof progressPercent === 'number' ? (
          <p className="text-xs text-gray-500 mb-2">
            Tiến độ: {progressPercent}%
          </p>
        ) : null}

        {/* Description - Truncated to 2 lines */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
          {truncateText(course.description, 2)}
        </p>

        {/* Number of lessons */}
        <div className="flex items-center text-gray-700 text-sm pt-2 border-t border-gray-200">
          <span className="font-semibold">📚 {course.lessons} bài học</span>
        </div>
      </div>
    </Link>
  );
}
