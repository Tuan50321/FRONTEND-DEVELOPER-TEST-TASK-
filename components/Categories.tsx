// Component client-side (sử dụng hooks)
'use client'

// Interface định nghĩa cấu trúc của một category item
export interface CategoryItem {
  id: string; // ID duy nhất của danh mục
  name: string; // Tên hiển thị
  count: number; // Số lượng khóa học
  icon: string; // Icon emoji
}

// Props của component Categories
interface CategoriesProps {
  selectedCategory: string; // ID của category đang được chọn
  onCategoryChange: (category: string) => void; // Hàm callback khi chọn category
  categories?: CategoryItem[]; // Danh sách categories tùy chọn (nếu không có sẽ dùng default)
}

// Danh sách categories mặc định
const defaultCategories: CategoryItem[] = [
  {
    id: 'all',
    name: 'Tất cả khóa học',
    count: 9,
    icon: '📚'
  },
  {
    id: 'development',
    name: 'Development',
    count: 4,
    icon: '💻'
  },
  {
    id: 'data-science',
    name: 'Data Science',
    count: 2,
    icon: '📊'
  },
  {
    id: 'mobile-development',
    name: 'Mobile Development',
    count: 1,
    icon: '📱'
  },
  {
    id: 'game-development',
    name: 'Game Development',
    count: 1,
    icon: '🎮'
  },
  {
    id: 'design',
    name: 'Design',
    count: 0,
    icon: '🎨'
  },
  {
    id: 'business',
    name: 'Business',
    count: 0,
    icon: '💼'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    count: 0,
    icon: '📈'
  }
];

// Component Categories - Hiển thị danh sách danh mục khóa học
export default function Categories({ selectedCategory, onCategoryChange, categories }: CategoriesProps) {
  // Sử dụng categories prop nếu có, ngược lại dùng default
  const list = categories && categories.length > 0 ? categories : defaultCategories
  return (
    <div id="categories" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>

      {/* Danh sách các category buttons */}
      <div className="space-y-2">
        {list.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)} // Gọi callback khi click
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-50 border border-blue-200 text-blue-700' // Style khi được chọn
                : 'hover:bg-gray-50 text-gray-700' // Style hover
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{category.icon}</span> {/* Icon của category */}
              <span className="font-medium">{category.name}</span> {/* Tên category */}
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-600' // Badge khi được chọn
                : 'bg-gray-100 text-gray-600' // Badge bình thường
            }`}>
              {category.count} {/* Số lượng khóa học */}
            </span>
          </button>
        ))}
      </div>

      {/* Phần Popular Topics - Chủ đề phổ biến */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Chủ đề phổ biến</h4>
        <div className="flex flex-wrap gap-2">
          {/* Render các topic buttons */}
          {['JavaScript', 'React', 'Python', 'Web Development', 'Machine Learning', 'Mobile App'].map((topic) => (
            <button
              key={topic}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}