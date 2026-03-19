// Import type Course từ types
import { Course } from '@/types/course';
// Import Link từ Next.js để navigation
import Link from 'next/link';

// Props của component CourseCard
interface CourseCardProps {
  course: Course; // Đối tượng course để hiển thị
}

// Component CourseCard - Hiển thị card thông tin khóa học
export default function CourseCard({ course }: CourseCardProps) {
  // Hàm rút gọn text theo số dòng (mặc định 2 dòng)
  const truncateText = (text: string, lines: number = 2) => {
    const lineArray = text.split('\n'); // Tách theo dòng
    return lineArray.slice(0, lines).join('\n'); // Lấy số dòng đầu và ghép lại
  };

  return (
    // Link đến trang chi tiết khóa học
    <Link
      href={`/courses/${course.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Thumbnail - Hình ảnh khóa học */}
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={course.thumbnail} // URL thumbnail
          alt={course.title} // Alt text
          className="w-full h-full object-cover" // Cover toàn bộ container
        />
      </div>

      {/* Content - Nội dung card */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Course Type and Level - Badges cho loại và mức độ */}
        <div className="flex gap-2 mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
            {course.type} {/* Loại khóa học */}
          </span>
          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">
            {course.level} {/* Mức độ khóa học */}
          </span>
        </div>

        {/* Title - Tiêu đề khóa học */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description - Mô tả khóa học, rút gọn 2 dòng */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
          {truncateText(course.description, 2)}
        </p>

        {/* Number of lessons - Số bài học */}
        <div className="flex items-center text-gray-700 text-sm pt-2 border-t border-gray-200">
          <span className="font-semibold">📚 {course.lessons} bài học</span>
        </div>
      </div>
    </Link>
  );
}
