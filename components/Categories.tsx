'use client'

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
  icon: string;
}

interface CategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: CategoryItem[];
}

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

export default function Categories({ selectedCategory, onCategoryChange, categories }: CategoriesProps) {
  const list = categories && categories.length > 0 ? categories : defaultCategories
  return (
    <div id="categories" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>

      <div className="space-y-2">
        {list.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Popular Topics */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Chủ đề phổ biến</h4>
        <div className="flex flex-wrap gap-2">
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