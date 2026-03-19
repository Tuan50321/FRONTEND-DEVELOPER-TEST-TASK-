// Định nghĩa interface cho Course (Khóa học)
export interface Course {
  id: number; // ID duy nhất của khóa học
  title: string; // Tiêu đề khóa học
  type: string; // Loại khóa học (ví dụ: Lập trình, Thiết kế)
  level: 'S' | 'Pres' | 'TC' | 'MTC'; // Mức độ: Sơ cấp, Trung cấp sơ, Trung cấp, Trung cấp cao
  description: string; // Mô tả chi tiết
  thumbnail: string; // URL hình ảnh thumbnail
  lessons: number; // Số lượng bài học
  instructor: string; // Tên giảng viên
  rating: number; // Đánh giá trung bình (1-5)
  reviews: number; // Số lượng đánh giá
  price: number; // Giá gốc
  discountedPrice: number; // Giá sau giảm
  enrolledStudents: number; // Số học viên đã đăng ký
}
