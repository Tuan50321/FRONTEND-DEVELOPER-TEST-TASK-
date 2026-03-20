export interface Course {
  id: number;
  title: string;
  type: string;
  level: 'S' | 'Pres' | 'TC' | 'MTC';
  description: string;
  thumbnail: string;
  lessons: number;
  instructor: string;
  rating: number;
  reviews: number;
  price: number;
  discountedPrice: number;
  enrolledStudents: number;
}
